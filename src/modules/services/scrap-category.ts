import { prisma } from "../../config";
import { ApiResult } from "../../utils/api-result";
import {
  ICreateScrapCategoryRequest,
  IUpdateScrapCategoryRequest,
  IScrapCategoryQueryParams,
} from "../model/scrap-category.interface";

export class ScrapCategoryService {
  public async createScrapCategory(data: ICreateScrapCategoryRequest): Promise<ApiResult> {
    try {
      // Ensure organization exists
      const organization = await prisma.organization.findUnique({
        where: { id: data.organizationId },
      });

      if (!organization) {
        return ApiResult.error("Organization not found", 404);
      }

      // Ensure unique name within organization
      const existing = await prisma.scrapCategory.findFirst({
        where: {
          name: data.name,
          organizationId: data.organizationId,
        },
      });

      if (existing) {
        return ApiResult.error("Scrap category with this name already exists for this organization", 400);
      }

      const scrapCategory = await prisma.scrapCategory.create({
        data: {
          organizationId: data.organizationId,
          name: data.name,
          description: data.description,
          isActive: data.isActive ?? true,
        },
        include: {
          organization: true,
        },
      });

      return ApiResult.success(scrapCategory, "Scrap category created successfully", 201);
    } catch (error: any) {
      console.log("Error in createScrapCategory", error);
      return ApiResult.error(error.message);
    }
  }

  public async getScrapCategories(query: IScrapCategoryQueryParams): Promise<ApiResult> {
    try {
      const { page = 1, limit = 10, search, organizationId, isActive } = query as any;

      const parsedPage = typeof page === "string" ? parseInt(page, 10) : Number(page) || 1;
      const parsedLimit = typeof limit === "string" ? parseInt(limit, 10) : Number(limit) || 10;
      const skip = (parsedPage - 1) * parsedLimit;

      const where: any = {};

      if (organizationId) {
        where.organizationId =
          typeof organizationId === "string" ? parseInt(organizationId, 10) : organizationId;
      }

      if (typeof isActive !== "undefined" && isActive !== null && isActive !== "") {
        if (typeof isActive === "boolean") {
          where.isActive = isActive;
        } else if (typeof isActive === "string") {
          const lowered = isActive.toLowerCase().trim();
          if (["true", "1", "yes", "y"].includes(lowered)) where.isActive = true;
          else if (["false", "0", "no", "n"].includes(lowered)) where.isActive = false;
        }
      }

      if (search) {
        where.OR = [
          { name: { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } },
        ];
      }

      const [scrapCategories, total] = await Promise.all([
        prisma.scrapCategory.findMany({
          where,
          skip,
          take: parsedLimit,
          include: {
            organization: true,
          },
          orderBy: {
            createdAt: "desc",
          },
        }),
        prisma.scrapCategory.count({ where }),
      ]);

      return ApiResult.success(
        {
          scrapCategories,
          pagination: {
            page: parsedPage,
            limit: parsedLimit,
            total,
            totalPages: Math.ceil(total / parsedLimit),
          },
        },
        "Scrap categories retrieved successfully",
      );
    } catch (error: any) {
      console.log("Error in getScrapCategories", error);
      return ApiResult.error(error.message);
    }
  }

  public async getScrapCategoryById(id: string): Promise<ApiResult> {
    try {
      const scrapCategory = await prisma.scrapCategory.findUnique({
        where: { id },
        include: {
          organization: true,
          scrapNames: true,
        },
      });

      if (!scrapCategory) {
        return ApiResult.error("Scrap category not found", 404);
      }

      return ApiResult.success(scrapCategory, "Scrap category retrieved successfully");
    } catch (error: any) {
      console.log("Error in getScrapCategoryById", error);
      return ApiResult.error(error.message);
    }
  }

  public async updateScrapCategory(id: string, data: IUpdateScrapCategoryRequest): Promise<ApiResult> {
    try {
      const existing = await prisma.scrapCategory.findUnique({
        where: { id },
      });

      if (!existing) {
        return ApiResult.error("Scrap category not found", 404);
      }

      if (data.name && data.name !== existing.name) {
        const duplicate = await prisma.scrapCategory.findFirst({
          where: {
            name: data.name,
            organizationId: existing.organizationId,
            id: { not: id },
          },
        });

        if (duplicate) {
          return ApiResult.error(
            "Scrap category with this name already exists for this organization",
            400,
          );
        }
      }

      const scrapCategory = await prisma.scrapCategory.update({
        where: { id },
        data,
        include: {
          organization: true,
        },
      });

      return ApiResult.success(scrapCategory, "Scrap category updated successfully");
    } catch (error: any) {
      console.log("Error in updateScrapCategory", error);
      return ApiResult.error(error.message);
    }
  }

  public async deleteScrapCategory(id: string): Promise<ApiResult> {
    try {
      const existing = await prisma.scrapCategory.findUnique({
        where: { id },
        include: { scrapNames: true },
      });

      if (!existing) {
        return ApiResult.error("Scrap category not found", 404);
      }

      if (existing.scrapNames && existing.scrapNames.length > 0) {
        return ApiResult.error(
          "Cannot delete scrap category while scrap names are still linked to it",
          400,
        );
      }

      await prisma.scrapCategory.delete({
        where: { id },
      });

      return ApiResult.success(null, "Scrap category deleted successfully");
    } catch (error: any) {
      console.log("Error in deleteScrapCategory", error);
      return ApiResult.error(error.message);
    }
  }
}


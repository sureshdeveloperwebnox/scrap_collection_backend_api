import { prisma } from "../../config";
import { ApiResult } from "../../utils/api-result";
import {
  ICreateScrapNameRequest,
  IUpdateScrapNameRequest,
  IScrapNameQueryParams,
} from "../model/scrap-name.interface";

export class ScrapNameService {
  public async createScrapName(data: ICreateScrapNameRequest): Promise<ApiResult> {
    try {
      // Ensure organization exists
      const organization = await prisma.organization.findUnique({
        where: { id: data.organizationId },
      });

      if (!organization) {
        return ApiResult.error("Organization not found", 404);
      }

      // Ensure scrap category exists and belongs to the same organization
      const category = await prisma.scrap_categories.findUnique({
        where: { id: data.scrapCategoryId },
      });

      if (!category || category.organizationId !== data.organizationId) {
        return ApiResult.error(
          "Scrap category not found or does not belong to this organization",
          400,
        );
      }

      // Unique name within category + organization
      const existing = await prisma.scrap_names.findFirst({
        where: {
          name: data.name,
          scrapCategoryId: data.scrapCategoryId,
          organizationId: data.organizationId,
        },
      });

      if (existing) {
        return ApiResult.error(
          "Scrap name with this name already exists in this category for this organization",
          400,
        );
      }

      const scrapName = await prisma.scrap_names.create({
        data: {
          name: data.name,
          scrapCategoryId: data.scrapCategoryId,
          organizationId: data.organizationId,
          isActive: data.isActive ?? true,
        },
        include: {
          scrap_categories: true,
          Organization: true,
        },
      });

      return ApiResult.success(scrapName, "Scrap name created successfully", 201);
    } catch (error: any) {
      console.log("Error in createScrapName", error);
      return ApiResult.error(error.message);
    }
  }

  public async getScrapNames(query: IScrapNameQueryParams): Promise<ApiResult> {
    try {
      const {
        page = 1,
        limit = 10,
        search,
        scrapCategoryId,
        organizationId,
        isActive,
      } = query as any;

      const parsedPage = typeof page === "string" ? parseInt(page, 10) : Number(page) || 1;
      const parsedLimit = typeof limit === "string" ? parseInt(limit, 10) : Number(limit) || 10;
      const skip = (parsedPage - 1) * parsedLimit;

      const where: any = {};

      if (organizationId) {
        where.organizationId =
          typeof organizationId === "string" ? parseInt(organizationId, 10) : organizationId;
      }

      if (scrapCategoryId) {
        where.scrapCategoryId = scrapCategoryId;
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
        where.name = { contains: search, mode: "insensitive" };
      }

      const [scrapNames, total] = await Promise.all([
        prisma.scrap_names.findMany({
          where,
          skip,
          take: parsedLimit,
          include: {
            scrap_categories: true,
          },
          orderBy: {
            createdAt: "desc",
          },
        }),
        prisma.scrap_names.count({ where }),
      ]);

      return ApiResult.success(
        {
          scrapNames,
          pagination: {
            page: parsedPage,
            limit: parsedLimit,
            total,
            totalPages: Math.ceil(total / parsedLimit),
          },
        },
        "Scrap names retrieved successfully",
      );
    } catch (error: any) {
      console.log("Error in getScrapNames", error);
      return ApiResult.error(error.message);
    }
  }

  public async getScrapNameById(id: string): Promise<ApiResult> {
    try {
      const scrapName = await prisma.scrap_names.findUnique({
        where: { id },
        include: {
          scrap_categories: true,
          Organization: true,
        },
      });

      if (!scrapName) {
        return ApiResult.error("Scrap name not found", 404);
      }

      return ApiResult.success(scrapName, "Scrap name retrieved successfully");
    } catch (error: any) {
      console.log("Error in getScrapNameById", error);
      return ApiResult.error(error.message);
    }
  }

  public async updateScrapName(id: string, data: IUpdateScrapNameRequest): Promise<ApiResult> {
    try {
      const existing = await prisma.scrap_names.findUnique({
        where: { id },
      });

      if (!existing) {
        return ApiResult.error("Scrap name not found", 404);
      }

      let scrapCategoryId = existing.scrapCategoryId;
      if (data.scrapCategoryId && data.scrapCategoryId !== existing.scrapCategoryId) {
        const category = await prisma.scrap_categories.findUnique({
          where: { id: data.scrapCategoryId },
        });

        if (!category || category.organizationId !== existing.organizationId) {
          return ApiResult.error(
            "Scrap category not found or does not belong to this organization",
            400,
          );
        }
        scrapCategoryId = data.scrapCategoryId;
      }

      if (data.name && (data.name !== existing.name || scrapCategoryId !== existing.scrapCategoryId)) {
        const duplicate = await prisma.scrap_names.findFirst({
          where: {
            name: data.name,
            scrapCategoryId,
            organizationId: existing.organizationId,
            id: { not: id },
          },
        });

        if (duplicate) {
          return ApiResult.error(
            "Scrap name with this name already exists in this category for this organization",
            400,
          );
        }
      }

      const scrapName = await prisma.scrap_names.update({
        where: { id },
        data,
        include: {
          scrap_categories: true,
          Organization: true,
        },
      });

      return ApiResult.success(scrapName, "Scrap name updated successfully");
    } catch (error: any) {
      console.log("Error in updateScrapName", error);
      return ApiResult.error(error.message);
    }
  }

  public async deleteScrapName(id: string): Promise<ApiResult> {
    try {
      const existing = await prisma.scrap_names.findUnique({
        where: { id },
      });

      if (!existing) {
        return ApiResult.error("Scrap name not found", 404);
      }

      await prisma.scrap_names.delete({
        where: { id },
      });

      return ApiResult.success(null, "Scrap name deleted successfully");
    } catch (error: any) {
      console.log("Error in deleteScrapName", error);
      return ApiResult.error(error.message);
    }
  }
}


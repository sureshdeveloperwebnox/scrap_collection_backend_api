"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScrapNameService = void 0;
const config_1 = require("../../config");
const api_result_1 = require("../../utils/api-result");
class ScrapNameService {
    async createScrapName(data) {
        var _a;
        try {
            // Ensure organization exists
            const organization = await config_1.prisma.organization.findUnique({
                where: { id: data.organizationId },
            });
            if (!organization) {
                return api_result_1.ApiResult.error("Organization not found", 404);
            }
            // Ensure scrap category exists and belongs to the same organization
            const category = await config_1.prisma.scrap_categories.findUnique({
                where: { id: data.scrapCategoryId },
            });
            if (!category || category.organizationId !== data.organizationId) {
                return api_result_1.ApiResult.error("Scrap category not found or does not belong to this organization", 400);
            }
            // Unique name within category + organization
            const existing = await config_1.prisma.scrap_names.findFirst({
                where: {
                    name: data.name,
                    scrapCategoryId: data.scrapCategoryId,
                    organizationId: data.organizationId,
                },
            });
            if (existing) {
                return api_result_1.ApiResult.error("Scrap name with this name already exists in this category for this organization", 400);
            }
            const scrapName = await config_1.prisma.scrap_names.create({
                data: {
                    name: data.name,
                    scrapCategoryId: data.scrapCategoryId,
                    organizationId: data.organizationId,
                    isActive: (_a = data.isActive) !== null && _a !== void 0 ? _a : true,
                },
                include: {
                    scrap_categories: true,
                    Organization: true,
                },
            });
            return api_result_1.ApiResult.success(scrapName, "Scrap name created successfully", 201);
        }
        catch (error) {
            console.log("Error in createScrapName", error);
            return api_result_1.ApiResult.error(error.message);
        }
    }
    async getScrapNames(query) {
        try {
            const { page = 1, limit = 10, search, scrapCategoryId, organizationId, isActive, } = query;
            const parsedPage = typeof page === "string" ? parseInt(page, 10) : Number(page) || 1;
            const parsedLimit = typeof limit === "string" ? parseInt(limit, 10) : Number(limit) || 10;
            const skip = (parsedPage - 1) * parsedLimit;
            const where = {};
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
                }
                else if (typeof isActive === "string") {
                    const lowered = isActive.toLowerCase().trim();
                    if (["true", "1", "yes", "y"].includes(lowered))
                        where.isActive = true;
                    else if (["false", "0", "no", "n"].includes(lowered))
                        where.isActive = false;
                }
            }
            if (search) {
                where.name = { contains: search, mode: "insensitive" };
            }
            const [scrapNames, total] = await Promise.all([
                config_1.prisma.scrap_names.findMany({
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
                config_1.prisma.scrap_names.count({ where }),
            ]);
            return api_result_1.ApiResult.success({
                scrapNames,
                pagination: {
                    page: parsedPage,
                    limit: parsedLimit,
                    total,
                    totalPages: Math.ceil(total / parsedLimit),
                },
            }, "Scrap names retrieved successfully");
        }
        catch (error) {
            console.log("Error in getScrapNames", error);
            return api_result_1.ApiResult.error(error.message);
        }
    }
    async getScrapNameById(id) {
        try {
            const scrapName = await config_1.prisma.scrap_names.findUnique({
                where: { id },
                include: {
                    scrap_categories: true,
                    Organization: true,
                },
            });
            if (!scrapName) {
                return api_result_1.ApiResult.error("Scrap name not found", 404);
            }
            return api_result_1.ApiResult.success(scrapName, "Scrap name retrieved successfully");
        }
        catch (error) {
            console.log("Error in getScrapNameById", error);
            return api_result_1.ApiResult.error(error.message);
        }
    }
    async updateScrapName(id, data) {
        try {
            const existing = await config_1.prisma.scrap_names.findUnique({
                where: { id },
            });
            if (!existing) {
                return api_result_1.ApiResult.error("Scrap name not found", 404);
            }
            let scrapCategoryId = existing.scrapCategoryId;
            if (data.scrapCategoryId && data.scrapCategoryId !== existing.scrapCategoryId) {
                const category = await config_1.prisma.scrap_categories.findUnique({
                    where: { id: data.scrapCategoryId },
                });
                if (!category || category.organizationId !== existing.organizationId) {
                    return api_result_1.ApiResult.error("Scrap category not found or does not belong to this organization", 400);
                }
                scrapCategoryId = data.scrapCategoryId;
            }
            if (data.name && (data.name !== existing.name || scrapCategoryId !== existing.scrapCategoryId)) {
                const duplicate = await config_1.prisma.scrap_names.findFirst({
                    where: {
                        name: data.name,
                        scrapCategoryId,
                        organizationId: existing.organizationId,
                        id: { not: id },
                    },
                });
                if (duplicate) {
                    return api_result_1.ApiResult.error("Scrap name with this name already exists in this category for this organization", 400);
                }
            }
            const scrapName = await config_1.prisma.scrap_names.update({
                where: { id },
                data,
                include: {
                    scrap_categories: true,
                    Organization: true,
                },
            });
            return api_result_1.ApiResult.success(scrapName, "Scrap name updated successfully");
        }
        catch (error) {
            console.log("Error in updateScrapName", error);
            return api_result_1.ApiResult.error(error.message);
        }
    }
    async deleteScrapName(id) {
        try {
            const existing = await config_1.prisma.scrap_names.findUnique({
                where: { id },
            });
            if (!existing) {
                return api_result_1.ApiResult.error("Scrap name not found", 404);
            }
            await config_1.prisma.scrap_names.delete({
                where: { id },
            });
            return api_result_1.ApiResult.success(null, "Scrap name deleted successfully");
        }
        catch (error) {
            console.log("Error in deleteScrapName", error);
            return api_result_1.ApiResult.error(error.message);
        }
    }
}
exports.ScrapNameService = ScrapNameService;

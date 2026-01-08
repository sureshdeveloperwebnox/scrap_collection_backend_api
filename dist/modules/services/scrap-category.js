"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScrapCategoryService = void 0;
const config_1 = require("../../config");
const api_result_1 = require("../../utils/api-result");
class ScrapCategoryService {
    async createScrapCategory(data) {
        var _a;
        try {
            // Ensure organization exists
            const organization = await config_1.prisma.organization.findUnique({
                where: { id: data.organizationId },
            });
            if (!organization) {
                return api_result_1.ApiResult.error("Organization not found", 404);
            }
            // Ensure unique name within organization
            const existing = await config_1.prisma.scrap_categories.findFirst({
                where: {
                    name: data.name,
                    organizationId: data.organizationId,
                },
            });
            if (existing) {
                return api_result_1.ApiResult.error("Scrap category with this name already exists for this organization", 400);
            }
            const scrapCategory = await config_1.prisma.scrap_categories.create({
                data: {
                    organizationId: data.organizationId,
                    name: data.name,
                    description: data.description,
                    isActive: (_a = data.isActive) !== null && _a !== void 0 ? _a : true,
                },
                include: {
                    Organization: true,
                },
            });
            return api_result_1.ApiResult.success(scrapCategory, "Scrap category created successfully", 201);
        }
        catch (error) {
            console.log("Error in createScrapCategory", error);
            return api_result_1.ApiResult.error(error.message);
        }
    }
    async getScrapCategories(query) {
        try {
            const { page = 1, limit = 10, search, organizationId, isActive } = query;
            const parsedPage = typeof page === "string" ? parseInt(page, 10) : Number(page) || 1;
            const parsedLimit = typeof limit === "string" ? parseInt(limit, 10) : Number(limit) || 10;
            const skip = (parsedPage - 1) * parsedLimit;
            const where = {};
            if (organizationId) {
                where.organizationId =
                    typeof organizationId === "string" ? parseInt(organizationId, 10) : organizationId;
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
                where.OR = [
                    { name: { contains: search, mode: "insensitive" } },
                    { description: { contains: search, mode: "insensitive" } },
                ];
            }
            const [scrapCategories, total] = await Promise.all([
                config_1.prisma.scrap_categories.findMany({
                    where,
                    skip,
                    take: parsedLimit,
                    include: {
                        Organization: true,
                    },
                    orderBy: {
                        createdAt: "desc",
                    },
                }),
                config_1.prisma.scrap_categories.count({ where }),
            ]);
            return api_result_1.ApiResult.success({
                scrapCategories,
                pagination: {
                    page: parsedPage,
                    limit: parsedLimit,
                    total,
                    totalPages: Math.ceil(total / parsedLimit),
                },
            }, "Scrap categories retrieved successfully");
        }
        catch (error) {
            console.log("Error in getScrapCategories", error);
            return api_result_1.ApiResult.error(error.message);
        }
    }
    async getScrapCategoryById(id) {
        try {
            const scrapCategory = await config_1.prisma.scrap_categories.findUnique({
                where: { id },
                include: {
                    Organization: true,
                    scrap_names: true,
                },
            });
            if (!scrapCategory) {
                return api_result_1.ApiResult.error("Scrap category not found", 404);
            }
            return api_result_1.ApiResult.success(scrapCategory, "Scrap category retrieved successfully");
        }
        catch (error) {
            console.log("Error in getScrapCategoryById", error);
            return api_result_1.ApiResult.error(error.message);
        }
    }
    async updateScrapCategory(id, data) {
        try {
            const existing = await config_1.prisma.scrap_categories.findUnique({
                where: { id },
            });
            if (!existing) {
                return api_result_1.ApiResult.error("Scrap category not found", 404);
            }
            if (data.name && data.name !== existing.name) {
                const duplicate = await config_1.prisma.scrap_categories.findFirst({
                    where: {
                        name: data.name,
                        organizationId: existing.organizationId,
                        id: { not: id },
                    },
                });
                if (duplicate) {
                    return api_result_1.ApiResult.error("Scrap category with this name already exists for this organization", 400);
                }
            }
            const scrapCategory = await config_1.prisma.scrap_categories.update({
                where: { id },
                data,
                include: {
                    Organization: true,
                },
            });
            return api_result_1.ApiResult.success(scrapCategory, "Scrap category updated successfully");
        }
        catch (error) {
            console.log("Error in updateScrapCategory", error);
            return api_result_1.ApiResult.error(error.message);
        }
    }
    async deleteScrapCategory(id) {
        try {
            const existing = await config_1.prisma.scrap_categories.findUnique({
                where: { id },
                include: { scrap_names: true },
            });
            if (!existing) {
                return api_result_1.ApiResult.error("Scrap category not found", 404);
            }
            if (existing.scrap_names && existing.scrap_names.length > 0) {
                return api_result_1.ApiResult.error("Cannot delete scrap category while scrap names are still linked to it", 400);
            }
            await config_1.prisma.scrap_categories.delete({
                where: { id },
            });
            return api_result_1.ApiResult.success(null, "Scrap category deleted successfully");
        }
        catch (error) {
            console.log("Error in deleteScrapCategory", error);
            return api_result_1.ApiResult.error(error.message);
        }
    }
}
exports.ScrapCategoryService = ScrapCategoryService;

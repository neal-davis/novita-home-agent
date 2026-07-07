jest.mock("@/api/api", () => ({
  request: jest.fn(),
  service_base_url: "https://gpu.example.test",
}));

import { request } from "@/api/api";
import {
  reqCollectUserCompany,
  reqCreateGpuInstance,
  reqGetMarketNode,
  reqGetProductExpandAmount,
  reqGetProductMonthlyPricing,
  reqMarketProducts,
  reqMarketQueryOptions,
  reqUploadUserRequestProduct,
} from "@/api/gpu-instance/explore";
import {
  reqDeleteGpuInstance,
  reqEditInstance,
  reqGpuInstance,
  reqInstanceMount,
  reqInstanceMountList,
  reqMigrateGpuInstance,
  reqRenewInstance,
  reqRestartGpuInstance,
  reqSetAutoMigrate,
  reqSetAutoRenew,
  reqSingleGpuInstance,
  reqStartGpuInstance,
  reqStartInstanceTerminal,
  reqStopGpuInstance,
  reqStopInstanceTerminal,
  reqTransToMonthlyInstance,
  reqUpdateGpuInstanceName,
  reqUpgradeInstance,
} from "@/api/gpu-instance/instances";
import {
  reqCreateNetworkStorage,
  reqDeleteNetworkStorage,
  reqGetStorage,
  reqGpuStorageBaseInfo,
  reqHomeProductsStorage,
  reqUpdateNetworkStorage,
} from "@/api/gpu-instance/storage";
import {
  reqAddTemplate,
  reqComplaintTemplate,
  reqDeleteTemplate,
  reqGetOfficialTemplateById,
  reqGetOfficialTemplates,
  reqGetTemplateById,
  reqGetTemplates,
  reqGetUnPrivateTemplateById,
  reqOperateTemplate,
  reqStorageLocalFree,
  reqUpdateTemplate,
} from "@/api/gpu-instance/templates";

const mockRequest = request as jest.Mock;
const baseUrl = "https://gpu.example.test/api/v1";

describe("gpu instance API wrappers", () => {
  const signal = new AbortController().signal;

  beforeEach(() => {
    mockRequest.mockResolvedValue({});
    jest.clearAllMocks();
  });

  it("builds market query and product requests with auth URL branches", () => {
    const queryParams = { auth: true, clusterId: "cluster-1" };
    reqMarketQueryOptions(queryParams);
    expect(mockRequest).toHaveBeenLastCalledWith({
      url: "/market/auth/query_options",
      method: "GET",
      base_url: baseUrl,
      query: { clusterId: "cluster-1" },
    });
    expect(queryParams).toEqual({ clusterId: "cluster-1" });

    reqMarketProducts({ auth: true, gpuName: "A10" }, signal);
    expect(mockRequest).toHaveBeenLastCalledWith({
      url: "/market/auth/products",
      method: "GET",
      base_url: baseUrl,
      query: { auth: true, gpuName: "A10" },
      signal,
    });

    reqGetMarketNode({ auth: false, productId: "product-1" }, signal);
    expect(mockRequest).toHaveBeenLastCalledWith({
      url: "/market/products/node",
      method: "GET",
      base_url: baseUrl,
      query: { auth: false, productId: "product-1" },
      signal,
    });
  });

  it("cleans create instance transient fields and trims entrypoint", () => {
    reqCreateGpuInstance({
      name: "instance",
      entrypoint: "  bash start.sh  ",
      priceInfos: { price: 1 },
      imageObj: { id: "image" },
      currProduct: { id: "product" },
    });

    expect(mockRequest).toHaveBeenLastCalledWith({
      url: "/gpu/instance",
      method: "POST",
      base_url: baseUrl,
      data: {
        name: "instance",
        entrypoint: "bash start.sh",
      },
    });
  });

  it("builds explore amount and callback requests", () => {
    reqGetProductMonthlyPricing({ productId: "product-1" });
    expect(mockRequest).toHaveBeenLastCalledWith({
      url: "/gpu/instance/calcMonthAmount",
      method: "POST",
      base_url: baseUrl,
      data: { productId: "product-1" },
    });

    reqGetProductExpandAmount({ productId: "product-1", targetGpuNum: 2 });
    expect(mockRequest).toHaveBeenLastCalledWith({
      url: "/gpu/instance/calcExpandAmount",
      method: "POST",
      base_url: baseUrl,
      data: { productId: "product-1", targetGpuNum: 2 },
    });

    reqUploadUserRequestProduct({ email: "a@example.com" });
    expect(mockRequest).toHaveBeenLastCalledWith({
      url: "/anycross/trigger/callback/MGRmOGM2ZWZmZWY3OWRlZWMxZGMzYzU1OGY1MDNhNzRm",
      method: "POST",
      base_url: "https://gpu.example.test",
      data: { email: "a@example.com" },
    });

    reqCollectUserCompany({ company: "Novita" });
    expect(mockRequest).toHaveBeenLastCalledWith({
      url: "/user/company",
      method: "POST",
      base_url: baseUrl,
      data: { company: "Novita" },
    });
  });

  it("builds instance lifecycle requests", () => {
    reqStartGpuInstance("instance-1");
    expect(mockRequest).toHaveBeenLastCalledWith({
      url: "/gpu/instance/start/instance-1",
      method: "POST",
      base_url: baseUrl,
    });

    reqRestartGpuInstance("instance-1");
    expect(mockRequest).toHaveBeenLastCalledWith({
      url: "/gpu/instance/restart/instance-1",
      method: "POST",
      base_url: baseUrl,
    });

    reqStopGpuInstance("instance-1");
    expect(mockRequest).toHaveBeenLastCalledWith({
      url: "/gpu/instance/stop/instance-1",
      method: "POST",
      base_url: baseUrl,
    });

    reqDeleteGpuInstance("instance-1");
    expect(mockRequest).toHaveBeenLastCalledWith({
      url: "/gpu/instance/instance-1",
      method: "DELETE",
      base_url: baseUrl,
    });

    reqMigrateGpuInstance("instance-1", { clusterId: "cluster-2" });
    expect(mockRequest).toHaveBeenLastCalledWith({
      url: "/gpu/instance/migrate/instance-1",
      method: "POST",
      base_url: baseUrl,
      data: { clusterId: "cluster-2" },
      ignoreMsg: true,
    });
  });

  it("builds instance list, detail and edit requests", () => {
    reqGpuInstance({ pageNum: 1 });
    expect(mockRequest).toHaveBeenLastCalledWith({
      url: "/gpu/instances",
      method: "GET",
      base_url: baseUrl,
      query: { pageNum: 1 },
    });

    reqSingleGpuInstance("instance-1");
    expect(mockRequest).toHaveBeenLastCalledWith({
      url: "/gpu/instance/instance-1",
      method: "GET",
      base_url: baseUrl,
      ignoreMsg: true,
    });

    reqUpdateGpuInstanceName({ instanceId: "instance-1", name: "New Name" });
    expect(mockRequest).toHaveBeenLastCalledWith({
      url: "/gpu/instance/instance-1",
      method: "PUT",
      base_url: baseUrl,
      data: { name: "New Name" },
    });

    reqUpgradeInstance("instance-1", { productId: "product-2" });
    expect(mockRequest).toHaveBeenLastCalledWith({
      url: "/gpu/instance/instance-1/upgrade",
      method: "POST",
      base_url: baseUrl,
      data: { productId: "product-2" },
    });

    reqEditInstance({
      instanceId: "instance-1",
      instanceParams: { image: "ubuntu" },
    });
    expect(mockRequest).toHaveBeenLastCalledWith({
      url: "/gpu/instance/instance-1/edit",
      method: "PUT",
      base_url: baseUrl,
      data: { image: "ubuntu" },
    });
  });

  it("builds renewal, terminal and mount requests", () => {
    reqRenewInstance({ instanceId: "instance-1" });
    expect(mockRequest).toHaveBeenLastCalledWith({
      url: "/gpu/instance/renewInstance",
      method: "POST",
      base_url: baseUrl,
      data: { instanceId: "instance-1" },
    });

    reqSetAutoRenew({ instanceId: "instance-1", autoRenew: true });
    expect(mockRequest).toHaveBeenLastCalledWith({
      url: "/gpu/instance/setAutoRenew",
      method: "POST",
      base_url: baseUrl,
      data: { instanceId: "instance-1", autoRenew: true },
    });

    reqSetAutoMigrate({ instanceId: "instance-1", autoMigrate: true });
    expect(mockRequest).toHaveBeenLastCalledWith({
      url: "/gpu/instance/setAutoMigrate",
      method: "POST",
      base_url: baseUrl,
      data: { instanceId: "instance-1", autoMigrate: true },
    });

    reqTransToMonthlyInstance({ instanceId: "instance-1" });
    expect(mockRequest).toHaveBeenLastCalledWith({
      url: "/gpu/instance/transToMonthlyInstance",
      method: "POST",
      base_url: baseUrl,
      data: { instanceId: "instance-1" },
    });

    reqStartInstanceTerminal("instance-1");
    expect(mockRequest).toHaveBeenLastCalledWith({
      url: "/gpu/instance/instance-1/terminal",
      method: "POST",
      base_url: baseUrl,
    });

    reqStopInstanceTerminal("instance-1");
    expect(mockRequest).toHaveBeenLastCalledWith({
      url: "/gpu/instance/instance-1/terminal/stop",
      method: "POST",
      base_url: baseUrl,
    });

    reqInstanceMount({ instanceId: "instance-1", storageId: "storage-1" });
    expect(mockRequest).toHaveBeenLastCalledWith({
      url: "/gpu/instanceMount",
      method: "POST",
      data: { instanceId: "instance-1", storageId: "storage-1" },
      base_url: baseUrl,
    });

    reqInstanceMountList({ instanceId: "instance-1" });
    expect(mockRequest).toHaveBeenLastCalledWith({
      url: "/gpu/instanceMountList",
      method: "GET",
      base_url: baseUrl,
      query: { instanceId: "instance-1" },
      ignoreMsg: true,
    });
  });

  it("builds storage CRUD requests", () => {
    reqGetStorage({ clusterId: "cluster-1" });
    expect(mockRequest).toHaveBeenLastCalledWith({
      url: "/networkstorages/list",
      method: "GET",
      base_url: baseUrl,
      query: { clusterId: "cluster-1" },
    });

    reqCreateNetworkStorage({ storageName: "data" });
    expect(mockRequest).toHaveBeenLastCalledWith({
      url: "/networkstorage/create",
      method: "POST",
      base_url: baseUrl,
      data: { storageName: "data" },
    });

    reqUpdateNetworkStorage({ storageId: "storage-1", storageName: "data" });
    expect(mockRequest).toHaveBeenLastCalledWith({
      url: "/networkstorage/update",
      method: "POST",
      base_url: baseUrl,
      data: { storageId: "storage-1", storageName: "data" },
    });

    reqDeleteNetworkStorage({ storageId: "storage-1" });
    expect(mockRequest).toHaveBeenLastCalledWith({
      url: "/networkstorage/delete",
      method: "POST",
      base_url: baseUrl,
      data: { storageId: "storage-1" },
    });

    reqGpuStorageBaseInfo({ clusterId: "cluster-1" });
    expect(mockRequest).toHaveBeenLastCalledWith({
      url: "/gpu/storage/base_info",
      method: "GET",
      base_url: baseUrl,
      query: { clusterId: "cluster-1" },
    });

    reqHomeProductsStorage();
    expect(mockRequest).toHaveBeenLastCalledWith({
      url: "/home/products/storage",
      method: "GET",
      base_url: baseUrl,
    });
  });

  it("builds template CRUD and handles official template not found fallback", async () => {
    reqGetOfficialTemplates({ pageNum: 1 });
    expect(mockRequest).toHaveBeenLastCalledWith({
      url: "/official/templates",
      method: "GET",
      base_url: baseUrl,
      query: { pageNum: 1 },
    });

    reqGetTemplates({ pageNum: 1 });
    expect(mockRequest).toHaveBeenLastCalledWith({
      url: "/templates",
      method: "GET",
      base_url: baseUrl,
      query: { pageNum: 1 },
    });

    reqGetTemplateById("template-1");
    expect(mockRequest).toHaveBeenLastCalledWith({
      url: "/template/template-1",
      method: "GET",
      base_url: baseUrl,
    });

    reqGetUnPrivateTemplateById("template-1");
    expect(mockRequest).toHaveBeenLastCalledWith({
      url: "/template/template-1?isCommunity=true",
      method: "GET",
      base_url: baseUrl,
    });

    mockRequest.mockRejectedValueOnce({ reason: "TEMPLATE_NOT_FOUND" });
    await expect(reqGetOfficialTemplateById("template-1")).resolves.toEqual({
      template: null,
    });

    reqAddTemplate({ name: "template" });
    expect(mockRequest).toHaveBeenLastCalledWith({
      url: "/template",
      method: "POST",
      base_url: baseUrl,
      data: { name: "template" },
    });

    reqUpdateTemplate({ id: "template-1", name: "template" });
    expect(mockRequest).toHaveBeenLastCalledWith({
      url: "/template",
      method: "PUT",
      base_url: baseUrl,
      data: { id: "template-1", name: "template" },
    });

    reqDeleteTemplate("template-1");
    expect(mockRequest).toHaveBeenLastCalledWith({
      url: "/template/template-1",
      method: "DELETE",
      base_url: baseUrl,
    });

    reqComplaintTemplate({ templateId: "template-1", reason: "bad" });
    expect(mockRequest).toHaveBeenLastCalledWith({
      url: "/template/complaint",
      method: "POST",
      base_url: baseUrl,
      data: { templateId: "template-1", reason: "bad" },
    });

    reqOperateTemplate({ templateId: "template-1", operate: "fav" });
    expect(mockRequest).toHaveBeenLastCalledWith({
      url: "/template/operate",
      method: "POST",
      base_url: baseUrl,
      data: { templateId: "template-1", operate: "fav" },
    });

    reqStorageLocalFree();
    expect(mockRequest).toHaveBeenLastCalledWith({
      url: "/gpu/storage/local/free",
      method: "GET",
      base_url: baseUrl,
    });
  });
});

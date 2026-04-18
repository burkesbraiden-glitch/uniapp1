"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_api = require("../../utils/api.js");
if (!Math) {
  TabBar();
}
const TabBar = () => "../../components/TabBar.js";
const _sfc_main = /* @__PURE__ */ common_vendor.defineComponent({
  __name: "index",
  setup(__props) {
    const goodsList = common_vendor.ref([]);
    const page = common_vendor.ref(1);
    const loading = common_vendor.ref(false);
    const noMore = common_vendor.ref(false);
    const keyword = common_vendor.ref("");
    const currentCategory = common_vendor.ref("全部");
    const categories = ["全部", "图书教材", "数码产品", "生活用品", "其他"];
    const goodsStore = common_vendor.reactive({
      keyword: "",
      category: "",
      sort: "created_at_desc"
    });
    const fetchGoods = async (isRefresh = false) => {
      if (loading.value || noMore.value && !isRefresh)
        return;
      loading.value = true;
      if (isRefresh) {
        page.value = 1;
        noMore.value = false;
      }
      try {
        const res = await common_vendor.index.request({
          url: `${utils_api.API_BASE_URL}/api/goods`,
          method: "GET",
          data: {
            page: page.value,
            per_page: 10,
            keyword: keyword.value,
            category: currentCategory.value === "全部" ? "" : currentCategory.value,
            sort: goodsStore.sort
          },
          header: {
            "Authorization": `Bearer ${common_vendor.index.getStorageSync("token") || ""}`
          }
        });
        if (res.statusCode === 200) {
          const data = res.data.data;
          if (isRefresh) {
            goodsList.value = data.items;
          } else {
            goodsList.value.push(...data.items);
          }
          if (data.items.length < 10) {
            noMore.value = true;
          }
          page.value++;
        }
      } catch (error) {
        console.error("获取商品列表失败:", error);
      } finally {
        loading.value = false;
        if (isRefresh) {
          common_vendor.index.stopPullDownRefresh();
        }
      }
    };
    const setCategory = (cat) => {
      currentCategory.value = cat;
      fetchGoods(true);
    };
    const search = () => {
      goodsStore.keyword = keyword.value;
      fetchGoods(true);
    };
    const goToDetail = (item) => {
      common_vendor.index.navigateTo({
        url: `/pages/detail/detail?id=${item.id}`
      });
    };
    const relativeTime = (isoStr) => {
      const diff = Date.now() - new Date(isoStr).getTime();
      const mins = Math.floor(diff / 6e4);
      if (mins < 1)
        return "刚刚";
      if (mins < 60)
        return `${mins}分钟前`;
      const hours = Math.floor(mins / 60);
      if (hours < 24)
        return `${hours}小时前`;
      return `${Math.floor(hours / 24)}天前`;
    };
    common_vendor.onLoad(() => {
      fetchGoods();
    });
    common_vendor.onPullDownRefresh(() => {
      fetchGoods(true);
    });
    common_vendor.onReachBottom(() => {
      fetchGoods();
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: keyword.value,
        b: common_vendor.o(($event) => keyword.value = $event.detail.value, "3a"),
        c: common_vendor.o(search, "ff"),
        d: common_vendor.f(categories, (cat, k0, i0) => {
          return {
            a: common_vendor.t(cat),
            b: cat,
            c: currentCategory.value === cat ? 1 : "",
            d: common_vendor.o(($event) => setCategory(cat), cat)
          };
        }),
        e: common_vendor.f(goodsList.value, (item, k0, i0) => {
          return {
            a: common_vendor.unref(utils_api.getImageUrl)(item.image_url),
            b: common_vendor.t(item.title),
            c: common_vendor.t(item.price),
            d: common_vendor.t(relativeTime(item.created_at)),
            e: item.id,
            f: common_vendor.o(($event) => goToDetail(item), item.id)
          };
        }),
        f: loading.value
      }, loading.value ? {} : noMore.value ? {} : {}, {
        g: noMore.value,
        h: common_vendor.p({
          current: 0
        })
      });
    };
  }
});
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-83a5a03c"]]);
wx.createPage(MiniProgramPage);

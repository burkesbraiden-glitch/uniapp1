"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_api = require("../../utils/api.js");
const _sfc_main = /* @__PURE__ */ common_vendor.defineComponent({
  __name: "detail",
  setup(__props) {
    const goods = common_vendor.ref(null);
    const loading = common_vendor.ref(true);
    const isFavorited = common_vendor.ref(false);
    const distance = common_vendor.ref("");
    const isLoggedIn = common_vendor.computed(() => {
      return !!common_vendor.index.getStorageSync("token");
    });
    const openMap = () => {
      if (!goods.value.latitude || !goods.value.longitude) {
        common_vendor.index.showToast({ title: "卖家未提供位置信息", icon: "none" });
        return;
      }
      if (utils_api.isH5()) {
        common_vendor.index.showModal({
          title: "提示",
          content: "H5环境下地图导航功能有限，请在App或小程序中打开",
          showCancel: false
        });
        return;
      }
      common_vendor.index.openLocation({
        latitude: parseFloat(goods.value.latitude),
        longitude: parseFloat(goods.value.longitude),
        name: "面交地点",
        scale: 15,
        success: () => {
          console.log("打开地图成功");
        },
        fail: () => {
          common_vendor.index.showToast({ title: "打开地图失败", icon: "none" });
        }
      });
    };
    const calculateDistance = (lat1, lng1, lat2, lng2) => {
      const R = 6371;
      const dLat = (lat2 - lat1) * Math.PI / 180;
      const dLng = (lng2 - lng1) * Math.PI / 180;
      const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return R * c;
    };
    const toggleFavorite = () => {
      if (!isLoggedIn.value) {
        common_vendor.index.showToast({ title: "请先登录", icon: "none" });
        return;
      }
      isFavorited.value = !isFavorited.value;
      common_vendor.index.showToast({
        title: isFavorited.value ? "收藏成功" : "取消收藏",
        icon: "success"
      });
    };
    const handleBuy = () => {
      common_vendor.index.showToast({ title: "已发送求购信息，请等待卖家回复", icon: "success" });
    };
    const goToLogin = () => {
      common_vendor.index.navigateTo({ url: "/pages/login/login" });
    };
    const goBack = () => {
      common_vendor.index.switchTab({ url: "/pages/index/index" });
    };
    common_vendor.onLoad(async (options) => {
      const id = options == null ? void 0 : options.id;
      if (!id) {
        loading.value = false;
        return;
      }
      try {
        const res = await common_vendor.index.request({
          url: `${utils_api.API_BASE_URL}/api/goods/${id}`,
          header: {
            "Authorization": `Bearer ${common_vendor.index.getStorageSync("token") || ""}`
          }
        });
        if (res.statusCode === 200) {
          goods.value = res.data.data;
          isFavorited.value = goods.value.is_favorited || false;
          if (goods.value.latitude && goods.value.longitude) {
            if (utils_api.isH5()) {
              distance.value = "H5环境暂不支持距离计算";
            } else {
              common_vendor.index.getLocation({
                type: "gcj02",
                success: (locRes) => {
                  const dist = calculateDistance(
                    locRes.latitude,
                    locRes.longitude,
                    parseFloat(goods.value.latitude),
                    parseFloat(goods.value.longitude)
                  );
                  distance.value = `距您约 ${dist.toFixed(2)} km`;
                },
                fail: () => {
                  distance.value = "无法获取您的位置";
                }
              });
            }
          }
        }
      } catch (error) {
        console.error("获取商品详情失败:", error);
      } finally {
        loading.value = false;
      }
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: loading.value
      }, loading.value ? {} : goods.value ? common_vendor.e({
        c: common_vendor.unref(utils_api.getImageUrl)(goods.value.image_url),
        d: common_vendor.t(goods.value.title),
        e: common_vendor.t(goods.value.category),
        f: common_vendor.t(goods.value.seller_nickname),
        g: common_vendor.t(goods.value.price),
        h: common_vendor.t(goods.value.description),
        i: goods.value.latitude && goods.value.longitude
      }, goods.value.latitude && goods.value.longitude ? common_vendor.e({
        j: distance.value
      }, distance.value ? {
        k: common_vendor.t(distance.value)
      } : {}, {
        l: common_vendor.o(openMap, "32")
      }) : {}, {
        m: isLoggedIn.value
      }, isLoggedIn.value ? {
        n: common_vendor.t(goods.value.contact)
      } : {
        o: common_vendor.o(goToLogin, "c6")
      }, {
        p: common_vendor.t(isFavorited.value ? "❤️" : "🤍"),
        q: common_vendor.t(isFavorited.value ? "已收藏" : "收藏"),
        r: common_vendor.o(toggleFavorite, "61"),
        s: isLoggedIn.value
      }, isLoggedIn.value ? {
        t: common_vendor.o(handleBuy, "67")
      } : {}) : {
        v: common_vendor.o(goBack, "1a")
      }, {
        b: goods.value
      });
    };
  }
});
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-9cb6f745"]]);
wx.createPage(MiniProgramPage);

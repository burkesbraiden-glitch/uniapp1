"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_api = require("../../utils/api.js");
if (!Math) {
  TabBar();
}
const TabBar = () => "../../components/TabBar.js";
const _sfc_main = /* @__PURE__ */ common_vendor.defineComponent({
  __name: "my",
  setup(__props) {
    const userInfo = common_vendor.ref({
      id: "",
      nickname: "",
      username: ""
    });
    const stats = common_vendor.ref(null);
    const isLoggedIn = common_vendor.computed(() => {
      return !!common_vendor.index.getStorageSync("token");
    });
    const loadUserInfo = async () => {
      const stored = common_vendor.index.getStorageSync("userInfo");
      if (stored) {
        userInfo.value = stored;
      }
      try {
        const res = await common_vendor.index.request({
          url: `${utils_api.API_BASE_URL}/api/user/profile`,
          header: {
            "Authorization": `Bearer ${common_vendor.index.getStorageSync("token") || ""}`
          }
        });
        if (res.statusCode === 200) {
          const data = res.data.data;
          stats.value = data;
          if (data.nickname) {
            userInfo.value.nickname = data.nickname;
          }
        }
      } catch (error) {
        console.error("获取用户信息失败:", error);
      }
    };
    const goToLogin = () => {
      common_vendor.index.navigateTo({ url: "/pages/login/login" });
    };
    const goToMyGoods = () => {
      common_vendor.index.showToast({ title: "我的发布功能开发中", icon: "none" });
    };
    const goToFavorites = () => {
      common_vendor.index.showToast({ title: "我的收藏功能开发中", icon: "none" });
    };
    const goToProfile = () => {
      common_vendor.index.showToast({ title: "个人资料功能开发中", icon: "none" });
    };
    const handleLogout = () => {
      common_vendor.index.showModal({
        title: "确认退出",
        content: "确定要退出登录吗？",
        success: (res) => {
          if (res.confirm) {
            common_vendor.index.removeStorageSync("token");
            common_vendor.index.removeStorageSync("userInfo");
            userInfo.value = { id: "", nickname: "", username: "" };
            stats.value = null;
            common_vendor.index.showToast({ title: "已退出登录", icon: "success" });
          }
        }
      });
    };
    common_vendor.onMounted(() => {
      if (isLoggedIn.value) {
        loadUserInfo();
      }
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: isLoggedIn.value
      }, isLoggedIn.value ? {
        b: common_vendor.t(userInfo.value.nickname),
        c: common_vendor.t(userInfo.value.id)
      } : {
        d: common_vendor.o(goToLogin, "d5")
      }, {
        e: isLoggedIn.value
      }, isLoggedIn.value ? {
        f: common_vendor.o(goToMyGoods, "0b")
      } : {}, {
        g: isLoggedIn.value
      }, isLoggedIn.value ? {
        h: common_vendor.o(goToFavorites, "15")
      } : {}, {
        i: isLoggedIn.value
      }, isLoggedIn.value ? {
        j: common_vendor.o(goToProfile, "81")
      } : {}, {
        k: !isLoggedIn.value
      }, !isLoggedIn.value ? {
        l: common_vendor.o(goToLogin, "27")
      } : {}, {
        m: isLoggedIn.value
      }, isLoggedIn.value ? {
        n: common_vendor.o(handleLogout, "17")
      } : {}, {
        o: isLoggedIn.value && stats.value
      }, isLoggedIn.value && stats.value ? {
        p: common_vendor.t(stats.value.goods_count || 0),
        q: common_vendor.t(stats.value.favorite_count || 0)
      } : {}, {
        r: common_vendor.p({
          current: 2
        })
      });
    };
  }
});
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-d3687551"]]);
wx.createPage(MiniProgramPage);

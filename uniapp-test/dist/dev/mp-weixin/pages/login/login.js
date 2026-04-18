"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_api = require("../../utils/api.js");
const _sfc_main = /* @__PURE__ */ common_vendor.defineComponent({
  __name: "login",
  setup(__props) {
    const form = common_vendor.reactive({
      username: "",
      password: ""
    });
    const showPassword = common_vendor.ref(false);
    const canLogin = common_vendor.computed(() => {
      return form.username && form.password;
    });
    const handleLogin = () => {
      if (!canLogin.value) {
        common_vendor.index.showToast({ title: "请填写完整信息", icon: "none" });
        return;
      }
      common_vendor.index.showLoading({ title: "登录中..." });
      common_vendor.index.request({
        url: `${utils_api.API_BASE_URL}/api/auth/login`,
        method: "POST",
        data: {
          username: form.username,
          password: form.password
        },
        success: (res) => {
          if (res.statusCode === 200) {
            const data = res.data.data;
            common_vendor.index.setStorageSync("token", data.token);
            common_vendor.index.setStorageSync("userInfo", data.user);
            common_vendor.index.showToast({ title: "登录成功", icon: "success" });
            setTimeout(() => {
              common_vendor.index.switchTab({ url: "/pages/index/index" });
            }, 1500);
          } else {
            common_vendor.index.showToast({ title: "登录失败", icon: "none" });
          }
        },
        fail: () => {
          common_vendor.index.showToast({ title: "网络错误", icon: "none" });
        },
        complete: () => {
          common_vendor.index.hideLoading();
        }
      });
    };
    const goToRegister = () => {
      common_vendor.index.navigateTo({ url: "/pages/register/register" });
    };
    return (_ctx, _cache) => {
      return {
        a: form.username,
        b: common_vendor.o(($event) => form.username = $event.detail.value, "5b"),
        c: showPassword.value ? "text" : "password",
        d: form.password,
        e: common_vendor.o(($event) => form.password = $event.detail.value, "b6"),
        f: common_vendor.t(showPassword.value ? "🙈" : "👁️"),
        g: common_vendor.o(($event) => showPassword.value = !showPassword.value, "3f"),
        h: !canLogin.value ? 1 : "",
        i: common_vendor.o(handleLogin, "5e"),
        j: common_vendor.o(goToRegister, "8d")
      };
    };
  }
});
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-cdfe2409"]]);
wx.createPage(MiniProgramPage);

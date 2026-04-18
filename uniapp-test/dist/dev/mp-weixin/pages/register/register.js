"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_api = require("../../utils/api.js");
const _sfc_main = /* @__PURE__ */ common_vendor.defineComponent({
  __name: "register",
  setup(__props) {
    const form = common_vendor.reactive({
      username: "",
      nickname: "",
      password: "",
      confirmPassword: ""
    });
    const canRegister = common_vendor.computed(() => {
      return form.username.length >= 5 && form.nickname && form.password.length >= 6 && form.password === form.confirmPassword;
    });
    const handleRegister = () => {
      if (!canRegister.value) {
        if (form.password !== form.confirmPassword) {
          common_vendor.index.showToast({ title: "两次密码不一致", icon: "none" });
        } else {
          common_vendor.index.showToast({ title: "请填写完整信息", icon: "none" });
        }
        return;
      }
      common_vendor.index.showLoading({ title: "注册中..." });
      common_vendor.index.request({
        url: `${utils_api.API_BASE_URL}/api/auth/register`,
        method: "POST",
        data: {
          username: form.username,
          nickname: form.nickname,
          password: form.password
        },
        success: (res) => {
          var _a;
          if (res.statusCode === 201) {
            common_vendor.index.showToast({ title: "注册成功", icon: "success" });
            setTimeout(() => {
              common_vendor.index.navigateTo({ url: "/pages/login/login" });
            }, 1500);
          } else {
            const errMsg = ((_a = res.data) == null ? void 0 : _a.message) || "注册失败";
            common_vendor.index.showToast({ title: errMsg, icon: "none" });
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
    const goToLogin = () => {
      common_vendor.index.navigateBack();
    };
    return (_ctx, _cache) => {
      return {
        a: form.username,
        b: common_vendor.o(($event) => form.username = $event.detail.value, "fc"),
        c: form.nickname,
        d: common_vendor.o(($event) => form.nickname = $event.detail.value, "a7"),
        e: form.password,
        f: common_vendor.o(($event) => form.password = $event.detail.value, "b7"),
        g: form.confirmPassword,
        h: common_vendor.o(($event) => form.confirmPassword = $event.detail.value, "0d"),
        i: !canRegister.value ? 1 : "",
        j: common_vendor.o(handleRegister, "43"),
        k: common_vendor.o(goToLogin, "15")
      };
    };
  }
});
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-97bb96ad"]]);
wx.createPage(MiniProgramPage);

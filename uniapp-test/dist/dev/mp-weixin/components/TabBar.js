"use strict";
const common_vendor = require("../common/vendor.js");
const _sfc_main = /* @__PURE__ */ common_vendor.defineComponent({
  __name: "TabBar",
  props: {
    current: {}
  },
  setup(__props) {
    const props = __props;
    const currentIndex = common_vendor.ref(props.current);
    common_vendor.watch(() => props.current, (val) => {
      currentIndex.value = val;
    });
    const switchTab = (index) => {
      if (currentIndex.value === index)
        return;
      currentIndex.value = index;
      if (index === 0) {
        common_vendor.index.switchTab({ url: "/pages/index/index" });
      } else if (index === 1) {
        common_vendor.index.navigateTo({ url: "/pages/publish/publish" });
      } else if (index === 2) {
        common_vendor.index.switchTab({ url: "/pages/my/my" });
      }
    };
    return (_ctx, _cache) => {
      return {
        a: currentIndex.value === 0 ? 1 : "",
        b: common_vendor.o(($event) => switchTab(0), "03"),
        c: common_vendor.o(($event) => switchTab(1), "5f"),
        d: currentIndex.value === 2 ? 1 : "",
        e: common_vendor.o(($event) => switchTab(2), "84")
      };
    };
  }
});
const Component = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-7d9a6b19"]]);
wx.createComponent(Component);

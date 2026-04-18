"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_api = require("../../utils/api.js");
const _sfc_main = /* @__PURE__ */ common_vendor.defineComponent({
  __name: "publish",
  setup(__props) {
    const form = common_vendor.reactive({
      title: "",
      description: "",
      price: "",
      category: "其他",
      imageUrl: "",
      latitude: null,
      longitude: null,
      locationDesc: ""
    });
    const locationName = common_vendor.ref("");
    const categories = ["图书教材", "数码产品", "生活用品", "其他"];
    const showISBNInput = common_vendor.ref(false);
    const isbnInput = common_vendor.ref("");
    const showLocationInput = common_vendor.ref(false);
    const canSubmit = common_vendor.computed(() => {
      return form.title && form.price && form.category && form.imageUrl;
    });
    const handleScanOrInput = () => {
      if (utils_api.isH5()) {
        showISBNInput.value = true;
      } else {
        scanISBN();
      }
    };
    const scanISBN = () => {
      common_vendor.index.scanCode({
        scanType: ["barCode"],
        success: (res) => {
          isbnInput.value = res.result;
          queryBookInfo();
        },
        fail: () => {
          common_vendor.index.showToast({ title: "扫码失败，请手动输入ISBN", icon: "none" });
          showISBNInput.value = true;
        }
      });
    };
    const queryBookInfo = () => {
      const isbn = isbnInput.value.trim();
      if (!isbn) {
        common_vendor.index.showToast({ title: "请输入ISBN编号", icon: "none" });
        return;
      }
      showISBNInput.value = false;
      common_vendor.index.showLoading({ title: "查询图书信息..." });
      common_vendor.index.request({
        url: `https://api.jike.xyz/situ/book/isbn/${isbn}`,
        success: (apiRes) => {
          const data = apiRes.data;
          if (data && data.data) {
            const book = data.data;
            form.title = book.name || book.title || "未知书名";
            form.description = `作者：${book.author || "未知"}
出版社：${book.publishing || "未知"}
原价：${book.price || "未知"}`;
            form.category = "图书教材";
            common_vendor.index.showToast({ title: "识别成功", icon: "success" });
          } else {
            common_vendor.index.showToast({ title: "未找到图书信息", icon: "none" });
          }
        },
        fail: () => {
          common_vendor.index.showToast({ title: "查询失败", icon: "none" });
        },
        complete: () => {
          common_vendor.index.hideLoading();
        }
      });
    };
    const chooseAndCompressImage = () => {
      common_vendor.index.chooseImage({
        count: 1,
        sizeType: ["compressed"],
        sourceType: ["album", "camera"],
        success: (res) => {
          const tempFilePath = res.tempFilePaths[0];
          common_vendor.index.showLoading({ title: "上传中..." });
          common_vendor.index.uploadFile({
            url: `${utils_api.API_BASE_URL}/api/upload`,
            filePath: tempFilePath,
            name: "image",
            header: {
              "Authorization": `Bearer ${common_vendor.index.getStorageSync("token") || ""}`
            },
            success: (uploadRes) => {
              try {
                const data = JSON.parse(uploadRes.data);
                if (data.url) {
                  form.imageUrl = `${utils_api.API_BASE_URL}${data.url}`;
                  common_vendor.index.showToast({ title: "上传成功", icon: "success" });
                } else {
                  common_vendor.index.showToast({ title: "上传失败", icon: "none" });
                }
              } catch {
                common_vendor.index.showToast({ title: "上传失败", icon: "none" });
              }
            },
            fail: () => {
              common_vendor.index.showToast({ title: "上传失败", icon: "none" });
            },
            complete: () => {
              common_vendor.index.hideLoading();
            }
          });
        }
      });
    };
    const getLocation = () => {
      if (utils_api.isH5()) {
        common_vendor.index.showModal({
          title: "提示",
          content: "H5环境下定位功能可能受限，请手动输入面交地点",
          showCancel: false
        });
        setTimeout(() => {
          showLocationInput.value = true;
        }, 500);
        return;
      }
      common_vendor.index.getLocation({
        type: "gcj02",
        success: (res) => {
          form.latitude = res.latitude;
          form.longitude = res.longitude;
          locationName.value = "已获取当前位置";
          common_vendor.index.showToast({ title: "位置获取成功", icon: "success" });
        },
        fail: () => {
          common_vendor.index.showToast({ title: "获取位置失败，请手动输入地址", icon: "none" });
          showLocationInput.value = true;
        }
      });
    };
    const confirmLocation = () => {
      showLocationInput.value = false;
      if (form.locationDesc) {
        common_vendor.index.showToast({ title: "地址已保存", icon: "success" });
      }
    };
    const submitPublish = () => {
      var _a;
      if (!canSubmit.value) {
        common_vendor.index.showToast({ title: "请填写完整信息", icon: "none" });
        return;
      }
      common_vendor.index.showLoading({ title: "发布中..." });
      common_vendor.index.request({
        url: `${utils_api.API_BASE_URL}/api/goods`,
        method: "POST",
        data: {
          title: form.title,
          description: form.description,
          price: parseFloat(form.price),
          category: form.category,
          contact: ((_a = common_vendor.index.getStorageSync("userInfo")) == null ? void 0 : _a.contact) || "请联系卖家",
          latitude: form.latitude,
          longitude: form.longitude
        },
        header: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${common_vendor.index.getStorageSync("token") || ""}`
        },
        success: (res) => {
          if (res.statusCode === 201) {
            common_vendor.index.showToast({ title: "发布成功", icon: "success" });
            setTimeout(() => {
              common_vendor.index.switchTab({ url: "/pages/index/index" });
            }, 1500);
          } else {
            common_vendor.index.showToast({ title: "发布失败", icon: "none" });
          }
        },
        fail: () => {
          common_vendor.index.showToast({ title: "发布失败", icon: "none" });
        },
        complete: () => {
          common_vendor.index.hideLoading();
        }
      });
    };
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.t(common_vendor.unref(utils_api.isH5)() ? "手动输入ISBN" : "扫码识别图书 (ISBN)"),
        b: common_vendor.o(handleScanOrInput, "e6"),
        c: showISBNInput.value
      }, showISBNInput.value ? {
        d: common_vendor.o(($event) => showISBNInput.value = false, "58"),
        e: isbnInput.value,
        f: common_vendor.o(($event) => isbnInput.value = $event.detail.value, "28"),
        g: common_vendor.o(($event) => showISBNInput.value = false, "58"),
        h: common_vendor.o(queryBookInfo, "7d")
      } : {}, {
        i: form.title,
        j: common_vendor.o(($event) => form.title = $event.detail.value, "6f"),
        k: form.description,
        l: common_vendor.o(($event) => form.description = $event.detail.value, "90"),
        m: form.price,
        n: common_vendor.o(($event) => form.price = $event.detail.value, "50"),
        o: common_vendor.f(categories, (cat, k0, i0) => {
          return {
            a: common_vendor.t(cat),
            b: cat,
            c: form.category === cat ? 1 : "",
            d: common_vendor.o(($event) => form.category = cat, cat)
          };
        }),
        p: form.imageUrl
      }, form.imageUrl ? {
        q: form.imageUrl
      } : {}, {
        r: common_vendor.o(chooseAndCompressImage, "dc"),
        s: common_vendor.t(locationName.value || form.locationDesc || "点击获取当前位置"),
        t: common_vendor.o(getLocation, "67"),
        v: showLocationInput.value
      }, showLocationInput.value ? {
        w: common_vendor.o(($event) => showLocationInput.value = false, "1a"),
        x: form.locationDesc,
        y: common_vendor.o(($event) => form.locationDesc = $event.detail.value, "23"),
        z: common_vendor.o(($event) => showLocationInput.value = false, "df"),
        A: common_vendor.o(confirmLocation, "61")
      } : {}, {
        B: !canSubmit.value ? 1 : "",
        C: common_vendor.o(submitPublish, "c7")
      });
    };
  }
});
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-7d70bb1b"]]);
wx.createPage(MiniProgramPage);

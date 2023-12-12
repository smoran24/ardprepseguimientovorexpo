sap.ui.define(["sap/ui/core/UIComponent", "sap/ui/Device", "AR_DP_REP_REPORTESEGUIMIENTOVOR_EXPO/AR_DP_REP_REPORTESEGUIMIENTOVOR_EXPO/model/models"], function (t,
	e, i) {
	"use strict";
	return t.extend("AR_DP_REP_REPORTESEGUIMIENTOVOR_EXPO.AR_DP_REP_REPORTESEGUIMIENTOVOR_EXPO.Component", {
		metadata: {
			manifest: "json"
		},
		init: function () {
			t.prototype.init.apply(this, arguments);
			this.getRouter().initialize();
			this.setModel(i.createDeviceModel(), "device");
		},
		getContentDensityClass: function () {
			if (!this._sContentDensityClass) {
				if (!sap.ui.Device.support.touch) {
					this._sContentDensityClass = "sapUiSizeCompact";
				} else {
					this._sContentDensityClass = "sapUiSizeCozy";
				}
			}
			return this._sContentDensityClass;
		}
	});
});
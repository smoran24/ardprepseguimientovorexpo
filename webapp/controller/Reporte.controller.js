sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/MessageBox",
	"sap/m/Button",
	"sap/m/Dialog",
	"sap/m/List",
	"sap/m/StandardListItem",
	"sap/m/Text",
	"sap/m/library",
	"sap/ui/core/IconPool",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/SimpleType",
	"sap/ui/model/ValidateException",
	"sap/ui/core/util/Export",
	"sap/ui/core/util/ExportTypeCSV"
], function (Controller, Button, MessageBox, Dialog, List, StandardListItem, Text, mobileLibrary, IconPool, JSONModel, SimpleType,
	ValidateException,
	Export, ExportTypeCSV
) {

	var oView, oSAPuser, t, company, nombreUsuario;
	var Vor;
	return Controller.extend("AR_DP_REP_REPORTESEGUIMIENTOVOR_EXPO.AR_DP_REP_REPORTESEGUIMIENTOVOR_EXPO.controller.Reporte", {
		onInit: function () {
			t = this;
			oView = this.getView();
			//Sentencia para minimizar contenido
			this.getView().addStyleClass(this.getOwnerComponent().getContentDensityClass());
            var appid = this.getOwnerComponent().getManifestEntry("/sap.app/id").replaceAll(".","/");
            var appModulePath = jQuery.sap.getModulePath(appid);
			$.ajax({
				type: 'GET',
				dataType: 'json',
				url: appModulePath + "/services/userapi/currentUser",
				success: function (dataR, textStatus, jqXHR) {
					oSAPuser = dataR.name;
					// oSAPuser = "P000253";
					t.leerUsuario(oSAPuser);
				},
				error: function (jqXHR, textStatus, errorThrown) {}
			});
			//t.leerUsuario(oSAPuser);
			t.ConsultaSolicitante();
			t.Consulta();
			t.ConsultaTpedido();

		},
		leerUsuario: function (oSAPuser) {
			var flagperfil = true;
            var appid = this.getOwnerComponent().getManifestEntry("/sap.app/id").replaceAll(".","/");
            var appModulePath = jQuery.sap.getModulePath(appid);
			var url =appModulePath  + '/destinations/IDP_Nissan/service/scim/Users/' + oSAPuser;
			//Consulta
			$.ajax({
				type: 'GET',
				url: url,
				contentType: 'application/json; charset=utf-8',
				dataType: 'json',
				async: false,
				success: function (dataR, textStatus, jqXHR) {
					if (dataR["urn:sap:cloud:scim:schemas:extension:custom:2.0:User"] === undefined) {
						var custom = "";
					} else {
						var custom = dataR["urn:sap:cloud:scim:schemas:extension:custom:2.0:User"].attributes;
					}
					for (var i = 0; i < dataR.groups.length; i++) {

						if (dataR.groups[i].value === "AR_DP_ADMINISTRADORDEALER" || dataR.groups[i].value === "AR_DP_USUARIODEALER") {

							flagperfil = false
							for (var x = 0; x < custom.length; x++) {
								if (custom[x].name === "customAttribute6") {
									company = "0000" + custom[x].value;

								}
							}
						}
					}
					if (!flagperfil) {

						oView.byId("dealer").setSelectedKey(company);
						oView.byId("dealer").setEditable(false);
						oView.byId("dealer1").setVisible(false);
						oView.byId("espacio1").setVisible(false);
						oView.byId("solicitantev").setVisible(false);
						oView.byId("destinatario").setVisible(true);
						oView.byId("Com").setEnabled(false);
						oView.byId("Com").setVisible(false);
						oView.byId("columnComDealer").setVisible(true);
						oView.byId("columnCom").setVisible(false);
						oView.byId("btnCom").setEnabled(false);
						oView.byId("btnColumn").setVisible(false);
						t.ConsultaDestinatario2();

					} else {
						oView.byId("dealer").setEditable(true);
						oView.byId("dealer1").setVisible(true);
						oView.byId("espacio1").setVisible(true);
						oView.byId("solicitantev").setVisible(true);
						oView.byId("destinatario").setVisible(true);
						oView.byId("columnComDealer").setVisible(false);
						oView.byId("columnCom").setVisible(true);
						oView.byId("Com").setEnabled(true);
						oView.byId("btnCom").setEnabled(true);
						oView.byId("btnColumn").setVisible(true);
						t.ConsultaDestinatario2();
					}

					isNissanUser = flagperfil;
					nombreUsuario = dataR.name.givenName + " " + dataR.name.familyName;  
				},
				error: function (jqXHR, textStatus, errorThrown) {

				}
			});

		},
		// consulta solicitante
		ConsultaSolicitante: function () {
            var appid = this.getOwnerComponent().getManifestEntry("/sap.app/id").replaceAll(".","/");
            var appModulePath = jQuery.sap.getModulePath(appid);
			var UrlSolicitante = appModulePath + '/destinations/AR_DP_REP_DEST_HANA/ODATA_masterPedido.xsodata/solicitante';
			//Consulta
			$.ajax({
				type: 'GET',
				url: UrlSolicitante,
				contentType: 'application/json; charset=utf-8',
				dataType: 'json',
				async: true,
				success: function (dataR, textStatus, jqXHR) {
					var cliente = new sap.ui.model.json.JSONModel(dataR.d.results);
					oView.setModel(cliente, "cliente");
				},
				error: function (jqXHR, textStatus, errorThrown) {
					//console.log(JSON.stringify(jqXHR));
				}
			});
		},
		//consulta destinatario
		ConsultaDestinatario: function () {
            var appid = this.getOwnerComponent().getManifestEntry("/sap.app/id").replaceAll(".","/");
            var appModulePath = jQuery.sap.getModulePath(appid);
			var key = '%27' + oView.byId("dealer").getSelectedKey() + '%27'; //aqui rescatas el valor 
			var Destinatario = '/destinations/AR_DP_REP_DEST_HANA/ODATA_masterPedido.xsodata/destinatario?$filter=SOLICITANTE%20eq%20';
			var url = Destinatario + key; // aca juntas la url con el filtro que quiere hacer 
			//	console.log(Destinatario);
			//Consulta
			$.ajax({
				type: 'GET',
				url:appModulePath + url,
				contentType: 'application/json; charset=utf-8',
				dataType: 'json',
				async: true,
				success: function (dataR, textStatus, jqXHR) {
					console.log(dataR.d.results);
					var Destinatarios = new sap.ui.model.json.JSONModel(dataR.d.results);

					oView.setModel(Destinatarios, "Destinatarios");
				},
				error: function (jqXHR, textStatus, errorThrown) {
					console.log(JSON.stringify(jqXHR));
				}
			});
		},
		ConsultaDestinatario2: function () {
            var appid = this.getOwnerComponent().getManifestEntry("/sap.app/id").replaceAll(".","/");
            var appModulePath = jQuery.sap.getModulePath(appid);
			var Destinatario = appModulePath + '/destinations/AR_DP_REP_DEST_HANA/ODATA_masterPedido.xsodata/destinatario';
			var url = Destinatario; // aca juntas la url con el filtro que quiere hacer 
			//	console.log(Destinatario);
			//Consulta
			$.ajax({
				type: 'GET',
				url: url,
				contentType: 'application/json; charset=utf-8',
				dataType: 'json',
				async: true,
				success: function (dataR, textStatus, jqXHR) {
					console.log(dataR.d.results);
					var Destinatarios = new sap.ui.model.json.JSONModel(dataR.d.results);

					oView.setModel(Destinatarios, "Destinatarios");
				},
				error: function (jqXHR, textStatus, errorThrown) {
					console.log(JSON.stringify(jqXHR));
				}
			});
		},
		// consulta tipo pedido 
		ConsultaTpedido: function () {
            var appid = this.getOwnerComponent().getManifestEntry("/sap.app/id").replaceAll(".","/");
            var appModulePath = jQuery.sap.getModulePath(appid);
			var consulta =appModulePath + "/destinations/AR_DP_REP_DEST_HANA/ODATA_masterPedido.xsodata/clasePedido";
			//Consulta
			$.ajax({
				type: 'GET',
				url: consulta,
				contentType: 'application/json; charset=utf-8',
				dataType: 'json',
				async: true,
				success: function (dataR, textStatus, jqXHR) {

					var Tpedido = new sap.ui.model.json.JSONModel(dataR.d.results);

					oView.setModel(Tpedido, "Tpedido");
				},

				error: function (jqXHR, textStatus, errorThrown) {
					console.log(JSON.stringify(jqXHR));
				},
			});
		},

		// consulta odata
		Consulta: function () {
            var appid = this.getOwnerComponent().getManifestEntry("/sap.app/id").replaceAll(".","/");
            var appModulePath = jQuery.sap.getModulePath(appid);
			var consulta = appModulePath + '/destinations/AR_DP_REP_DEST_HANA/ODATA_masterPedido.xsodata';
			//Consulta
			$.ajax({
				type: 'GET',
				url: consulta,
				contentType: 'application/json; charset=utf-8',
				dataType: 'json',
				async: true,
				success: function (dataR, textStatus, jqXHR) {
					//	console.log(dataR);
					t.ConsultaVOR();
				},
				error: function (jqXHR, textStatus, errorThrown) {
					console.log(JSON.stringify(jqXHR));
				}
			});
		},

		ConsultaVOR: function (valor) {
            var appid = this.getOwnerComponent().getManifestEntry("/sap.app/id").replaceAll(".","/");
            var appModulePath = jQuery.sap.getModulePath(appid);
			var consulta = appModulePath + '/destinations/AR_DP_REP_DEST_HANA/ODATA_masterPedido.xsodata/VorRepuesto?$top=600';
			//Consulta
			$.ajax({
				type: 'GET',
				url: consulta,
				contentType: 'application/json; charset=utf-8',
				dataType: 'json',
				async: true,
				success: function (dataR, textStatus, jqXHR) {
					var Vor = dataR;
					oView.setModel(Vor, "pedidos_vor");
					var r = oView.getModel("pedidos_vor")
					console.log(r);
				},
				error: function (jqXHR, textStatus, errorThrown) {
					console.log(JSON.stringify(jqXHR));
				}
			});
		},
		press: function (oEvent) {
			oSelectedItem = oEvent.getSource().getParent();
			var mod = oSelectedItem.oBindingContexts.pedidos.sPath.replace(/\//g, "");
			console.log(mod);
			var j = oView.getModel("pedidos").oData[mod];
			oView.setModel(j, "update_vor");
			var transaccion = oView.getModel("update_vor");
			console.log(transaccion.Pedido, transaccion.Remito);
			var comentario = transaccion.Remito;

			var jsongrabar;
			if (comentario != "" || comentario !== null) {
				jsongrabar = {
					"ID_PEDIDO": Number(transaccion.Pedido),
					"MATERIAL": transaccion.Material,
					"COMENTARIO": comentario, //"",
					"FECHA_CREACION": "\/Date(" + new Date().getTime() + ")\/",
					"USUARIO_CREACION": oSAPuser,
					"FECHA_MODIFICACION": null, //"",
					"USUARIO_MODIFICACION": null, //""
					"VIN": transaccion.Vin
				};
                var appid = this.getOwnerComponent().getManifestEntry("/sap.app/id").replaceAll(".","/");
                var appModulePath = jQuery.sap.getModulePath(appid);
				$.ajax({
					type: 'POST',
					url: appModulePath + '/destinations/AR_DP_REP_DEST_HANA/ODATA_masterPedido.xsodata/VorRepuesto',
					contentType: 'application/json; charset=utf-8',
					dataType: 'json',
					async: true,
					data: JSON.stringify(jsongrabar),

					success: function (dataG, textStatus, jqXHR) {
						var obj2 = {
							codigo: "200",
							descripcion: "Su Comentario VOR fue generado exitosamente"
						}
						var arr2 = [];
						arr2.push(obj2);
						t.popSuccesCorreo(arr2, "Mensaje");
						t.ConsultaVOR();

						let idPedido = Number(transaccion.Pedido);
						let idMaterial = transaccion.Material
						//t.generarEntradaAuditoria(idPedido, idMaterial, comentario);
					},
					error: function (jqXHR, textStatus, errorThrown) {
						var obj2 = {
							codigo: "04",
							descripcion: "Ya existe comentario VOR"
						};
						console.log(obj2);
						jsongrabar = {
							"ID_PEDIDO": Number(transaccion.Pedido),
							"MATERIAL": transaccion.Material,
							"COMENTARIO": comentario,
							"TIPO_PEDIDO": "YNCI",
							"FECHA_MODIFICACION": "\/Date(" + new Date().getTime() + ")\/",
							"USUARIO_MODIFICACION": oSAPuser,
							"VIN": transaccion.Vin
						};
						var idp = Number(transaccion.Pedido);
						var idm = transaccion.Material;
						console.log(idp, idm);
						var filtro = "(ID_PEDIDO=" + idp + ",MATERIAL='" + idm + "')"
                        var appid = this.getOwnerComponent().getManifestEntry("/sap.app/id").replaceAll(".","/");
                        var appModulePath = jQuery.sap.getModulePath(appid);
						$.ajax({
							type: 'PUT',
							url: appModulePath + '/destinations/AR_DP_REP_DEST_HANA/ODATA_masterPedido.xsodata/VorRepuesto' + filtro,
							contentType: 'application/json; charset=utf-8',
							dataType: 'json',
							async: true,
							data: JSON.stringify(jsongrabar),

							success: function (dataG, textStatus, jqXHR) {
								var obj2 = {
									codigo: "200",
									descripcion: "Su Comentario VOR fue generado exitosamente"
								}
								var arr2 = [];
								arr2.push(obj2);
								t.popSuccesCorreo(arr2, "Mensaje");
								t.ConsultaVOR();
								//t.generarEntradaAuditoria(idp, idm, comentario);
							},
							error: function (jqXHR, textStatus, errorThrown) {
								var obj2 = {
									codigo: "04",
									descripcion: "Error al crear comentario VOR"
								};
								var arr2 = [];
								arr2.push(obj2);
								t.popSuccesCorreo(arr2, "ERROR");
								t.ConsultaVOR();
							}
						});

					}
				});
				t.BusquedaPedido();
			} else {

			}
		},
		
		generarEntradaAuditoria: function(nroPedido, idMaterial, comentario){
			let dfdGenerarEntrada = $.Deferred();
			var appid = this.getOwnerComponent().getManifestEntry("/sap.app/id").replaceAll(".","/");
			var appModulePath = jQuery.sap.getModulePath(appid);
			let oModel = new sap.ui.model.odata.ODataModel(appModulePath +'/destinations/AR_DP_REP_DEST_HANA/ODATA_masterPedido.xsodata', false);
			let identificador = {
				"NÃºmero pedido": nroPedido,
				"Material": idMaterial,
				"Comentario": comentario
			}
			
			let data = {
				ID_OBJETO: JSON.stringify(identificador),
				ID_ACCION: 16,
				TIPO_USUARIO: isNissanUser ? "N" : "D",
				USUARIO: oSAPuser,
				NOMBRE_USUARIO: nombreUsuario,
				FECHA: new Date()
			};
			
			oModel.create("/EntradaAuditoria", data, {
				success: function (odata, oResponse) {
					dfdGenerarEntrada.resolve();
				}
			});
			
			return dfdGenerarEntrada;
		},

		NombreDealer: function (dato) {
			var json4 = oView.getModel("Destinatarios").oData;
			for (var k = 0; k < json4.length; k++) {

				if (dato === json4[k].SOLICITANTE) {

					var NOMBREDEALER = json4[k].NOMBRE_SOLICITANTE;
					console.log(NOMBREDEALER);

				}
			}
			return NOMBREDEALER;
		},
		NombreDestinatario: function (dato) {
			var json4 = oView.getModel("Destinatarios").oData;
			for (var k = 0; k < json4.length; k++) {

				if (dato === json4[k].SOLICITANTE) {
					var NOMBREDestinatario = json4[k].NOMBRE_DESTINATARIO;
					console.log(NOMBREDestinatario);
				}

			}
			return NOMBREDestinatario;
		},

		BusquedaPedido: function () {
			var arr = [];
			var Tpedido = new sap.ui.model.json.JSONModel(arr);
			oView.setModel(Tpedido, "pedidos");
			var NOMBREDEALER;
			//	console.log(oView.byId("Fecha").getValue());
			if ((oView.byId("Fecha").getValue() === null || oView.byId("Fecha").getValue() === "") && oView.byId("NPedido").getValue() === "") {
				var obj2 = {
					codigo: "03",
					descripcion: "Debe seleccionar un rango de Fecha  o Ingresar un Número de Pedido"
				};
				var arr2 = [];
				arr2.push(obj2);
				t.popSuccesCorreo(arr2, "ERROR");
			} else {
				var arr = [];
				var semanaEnMilisegundos = (1000 * 60 * 60 * 24 * 90);
				var hoy = new Date() - semanaEnMilisegundos;

				hoy = new Date(hoy).toISOString().slice(0, 10);
				var desde = oView.byId("Fecha").getDateValue();
				var hasta = oView.byId("Fecha").getSecondDateValue();
				desde = new Date(desde).toISOString().slice(0, 10);
				hasta = new Date(hasta).toISOString().slice(0, 10);

				t.popCarga();
				var arryT = [];
				//	console.log(oView.byId("Fecha").getValue());
				if (oView.byId("Fecha").getValue() !== "" && oView.byId("Fecha").getValue() !== null) {
					var desde = oView.byId("Fecha").getDateValue();
					var hasta = oView.byId("Fecha").getSecondDateValue();
					desde = new Date(desde).toISOString().slice(0, 10).replace(/\-/g, "");
					//	console.log(desde);
					hasta = new Date(hasta).toISOString().slice(0, 10).replace(/\-/g, "");
					//	console.log(hasta);
					// desde = new Date(desde).toISOString().slice(0, 10).replace(/\-/g, "");
					// hasta = new Date(hasta).toISOString().slice(0, 10).replace(/\-/g, "");

				} else {
					desde = "";
					hasta = "";

				}
				//		console.log(desde + "---" + hasta);

				var json = {
					"HeaderSet": {
						"Header": {
							"Pedido": "",
							"Nav_Header_Pedidos": {
								"Pedidos": [{

									"Pedido": oView.byId("NPedido").getValue(),
									"Fechahasta": hasta,
									"Destinatario": oView.byId("Destinatario").getSelectedKey(),
									"Fechadesde": desde,
									"Etapapedido": "01",
									"Material": oView.byId("materialSearch").getValue(),
									"Dealer": oView.byId("dealer").getSelectedKey()

								}]
							}
						}
					}
				};
                var appid = this.getOwnerComponent().getManifestEntry("/sap.app/id").replaceAll(".","/");
                var appModulePath = jQuery.sap.getModulePath(appid);
				//Consulta
				$.ajax({
					type: 'POST',
					url: appModulePath + '/destinations/AR_DP_DEST_CPI/http/AR/DealerPortal/Pedido/Reporte',
					contentType: 'application/json; charset=utf-8',
					dataType: 'json',
					async: true,
					data: JSON.stringify(json),
					success: function (dataR, textStatus, jqXHR) {
						t.cerrarPopCarga2();
						var NOMBREDestinatario;

						var datos = dataR.HeaderSet.Header.Nav_Header_Pedidos.Pedidos;
						// console.log(datos.length);
						// console.log(datos);
						var datosVor = oView.getModel("pedidos_vor").d.results;
						// console.log(datosVor);
						if (datos.length === undefined) {
							var ped;
							for (var j = 0; j < datosVor.length; j++) {
								ped = Number(datos.Pedido);
								// console.log(ped);
								if (datosVor[j].ID_PEDIDO === ped && datos.Material === datosVor[j].MATERIAL) {
									datos.Remito = datosVor[j].COMENTARIO;
									datos.Bulto = "S";
									datos.Vin = datosVor[j].VIN;
									// console.log(datosVor[j].ID_PEDIDO);
									// console.log(datos);
									continue;
								}
							}
							if (datos.Bulto != "S") {
								if (datos.Tipo === "YNCI") {
									// console.log(datos);
								} else {
									// console.log(datos);
									datos = [];
									// console.log(datos);

								}
							}
						}
						for (var i = 0; i < datos.length; i++) {
							var ped;
							for (var j = 0; j < datosVor.length; j++) {
								ped = Number(datos[i].Pedido);
								// console.log(ped);
								if (datosVor[j].ID_PEDIDO === ped && datos[i].Material === datosVor[j].MATERIAL) {
									datos[i].Remito = datosVor[j].COMENTARIO;
									datos[i].Bulto = "S";
									datos[i].Vin = datosVor[j].VIN;
									// console.log(datosVor[j].ID_PEDIDO);
									// console.log(datos[i]);
									continue;
								}
							}
							if (datos[i].Bulto != "S") {
								if (datos[i].Tipo === "YNCI") {
									// console.log(datos[i]);
								} else {
									// console.log(datos[i]);
									datos.splice(i, 1);
									// console.log(datos[i]);
									i--;
								}
							}
						}

						if (datos.length === undefined) {
							if (datos.Pcm !== "") {
								var json4 = oView.getModel("cliente").oData;

								console.log(json4);

								for (var j = 0; j < json4.length; j++) {
									console.log(datos.Dealer);
									console.log(datos.Destinatario);
									if (datos.Dealer === json4[j].SOLICITANTE) {
										NOMBREDEALER = json4[j].NOMBRE_SOLICITANTE;
									}
									if (datos.Destinatario === json4[j].SOLICITANTE) {
										NOMBREDestinatario = json4[j].NOMBRE_SOLICITANTE;
									}

								}

								var dia = datos.Fecha.substring(6, 8);
								var mes = datos.Fecha.substring(4, 6);
								var year = datos.Fecha.substring(0, 4);
								var fecha = dia + "/" + mes + "/" + year;
								datos.Fecha = fecha;
								//convertir clase
								if (datos.Tipo === "YNCI") {
									datos.Tipo = "Pedido Inmovilizado";
								}
								if (datos.Tipo === "YNCS") {
									datos.Tipo = "Pedido  Stock";
								}
								if (datos.Tipo === "YNCU") {
									datos.Tipo = "Pedido  Urgente";
								}
								if (datos.Tipo === "YNPI") {
									datos.Tipo = "Pedido Interno";
								}
								if (Number(datos.Pcm) > 0) {
									datos.Pcm = datos.Pcm + " ARS";
								}

								datos.Pcm = (datos.Pcm).replace(/\./g, ",");
								console.log(datos)
								arryT.push({
									Bulto: Number(datos.Bulto),
									Cantidad: Number(datos.Cantidad),
									Dealer: datos.Dealer,
									Despacho: datos.Despacho,
									Destinatario: datos.Destinatario,
									Nombre: t.NombreDealer(datos.Dealer),
									NOMBREDestinatario: t.NombreDestinatario(datos.Dealer),
									Etapapedido: datos.Etapapedido,
									Fecha: datos.Fecha,
									Fechadesde: datos.Fechadesde,
									Fechahasta: datos.Fechahasta,
									Material: datos.Material,
									Descripcion: datos.Descripcion,
									Pcm: datos.Pcm,
									Pedido: datos.Pedido,
									Pedidodealer: datos.Pedidodealer,
									Remito: datos.Remito,
									Tipo: datos.Tipo,
									Tipopedido: datos.Tipopedido,
									Vin: datos.Vin
								});
							} else {
								arryT = [];
							}
						} else {

							for (var i = 0; i < datos.length; i++) {

								/*	for (var k = 0; k < json4.length; k++) {

										if (datos[i].Dealer === json4[k].SOLICITANTE) {

											NOMBREDEALER = json4[k].NOMBRE_SOLICITANTE;
											console.log(NOMBREDEALER);

										}

										if (datos[i].Destinatario === json4[k].SOLICITANTE) {
											NOMBREDestinatario = json4[k].NOMBRE_SOLICITANTE;
											console.log(NOMBREDestinatario);
										}

									}*/

								console.log(datos)
								var dia3 = datos[i].Fecha.substring(6, 8);
								var mes3 = datos[i].Fecha.substring(4, 6);
								var year3 = datos[i].Fecha.substring(0, 4);
								var fecha3 = dia3 + "/" + mes3 + "/" + year3;
								datos[i].Fecha = fecha3;

								if (datos[i].Tipo === "YNCI") {
									datos[i].Tipo = "Pedido Inmovilizado";
								}
								if (datos[i].Tipo === "YNCS") {
									datos[i].Tipo = "Pedido Stock";
								}
								if (datos[i].Tipo === "YNCU") {
									datos[i].Tipo = "Pedido Urgente";
								}
								if (datos[i].Tipo === "YNPI") {
									datos[i].Tipo = "Pedido Interno";
								}

								if (datos[i].Etapapedido === "01") {
									datos[i].Etapapedido = "Diferido";
								}
								if (datos[i].Etapapedido === "02") {
									datos[i].Etapapedido = "Pendiente";
								}
								if (datos[i].Etapapedido === "03") {
									datos[i].Etapapedido = "Preparación";
								}
								if (datos[i].Etapapedido === "04") {
									datos[i].Etapapedido = "Preparado";
								}
								if (datos[i].Etapapedido === "05") {
									datos[i].Etapapedido = "Remitido";
								}
								if (datos[i].Etapapedido === "06") {
									datos[i].Etapapedido = " Próximo a Fact";
								}
								if (datos[i].Etapapedido === "07") {
									datos[i].Etapapedido = "Facturado";
								}

								if (Number(datos[i].Pcm) > 0) {
									datos[i].Pcm = datos[i].Pcm + " ARS";
								}
								arryT.push({
									Bulto: Number(datos[i].Bulto),
									Cantidad: Number(datos[i].Cantidad),
									Dealer: datos[i].Dealer,
									Despacho: datos[i].Despacho,
									Destinatario: datos[i].Destinatario,
									Nombre: t.NombreDealer(datos[i].Dealer),
									NOMBREDestinatario: t.NombreDestinatario(datos[i].Dealer),
									Etapapedido: datos[i].Etapapedido,
									Fecha: datos[i].Fecha,
									Fechadesde: datos[i].Fechadesde,
									Fechahasta: datos[i].Fechahasta,
									Material: datos[i].Material,
									Descripcion: datos[i].Descripcion,
									Pcm: datos[i].Pcm.replace(/\./g, ","),
									Pedido: datos[i].Pedido,
									Pedidodealer: datos[i].Pedidodealer,
									Remito: datos[i].Remito,
									Tipo: datos[i].Tipo,
									Vin: datos[i].Vin
								});

							}
						}
						var Tpedido = new sap.ui.model.json.JSONModel(arryT);
						oView.setModel(Tpedido, "pedidos");

					},
					error: function (jqXHR, textStatus, errorThrown) {
						var arr = [];

					}
				});
			}
			//		}
		},
		buscar: function () {
			var dealer = "";
			var desde, hasta;

			if (oView.byId("DP6").getValue() !== "" && oView.byId("DP6").getValue() !== null) {
				desde = oView.byId("Fecha").getDateValue();
				hasta = oView.byId("Fecha").getSecondDateValue();
				desde = new Date(desde).toISOString().slice(0, 10);
				hasta = new Date(hasta).toISOString().slice(0, 10);
			} else {
				desde = "";
				hasta = "";

			}
		},
		//////*****************************correo********

		EnvioCorreo: function (evt) {

			var oDialog = oView.byId("EnvioCorreo");
			// create dialog lazily
			if (!oDialog) {
				// create dialog via fragment factory
				oDialog = sap.ui.xmlfragment(oView.getId(), "AR_DP_REP_REPORTESEGUIMIENTOVOR_EXPO.AR_DP_REP_REPORTESEGUIMIENTOVOR_EXPO.view.Correo", this);
				oView.addDependent(oDialog);
			}
			oDialog.open();

		},
		cerrarEnvioCorreo: function () {
			//	t.limpiezacorreo();
			oView.byId("EnvioCorreo").close();
		},

		estructura: function () {
			var desde = oView.byId("Fecha").getDateValue();
			var hasta = oView.byId("Fecha").getSecondDateValue();
			desde = new Date(desde).toISOString().slice(0, 10);
			hasta = new Date(hasta).toISOString().slice(0, 10);
			var json = oView.getModel("pedidos").oData;
			console.log(json);

			//	var solicitante = oUsuariosap;
			var datos = "";
			var titulo =
				"<table><tr><td class= subhead>REPORTE -<b> Pedidos VOR </b><p></td></tr><p><tr><td class= h1>  Desde el portal de Dealer Portal," +
				"se Envia el reporte de Pedidos VOR Correspondiente a las fechas desde : " + desde + " Hasta " + hasta +
				" :  <p> Los pedidos son :<p> ";
			var final = "</tr></table><p>Saludos <p> Dealer Portal Argentina </td> </tr> </table>";
			var cuerpo =
				"<table><tr><th>Pedido <th>Pedido Dealer</th><th>Solicitante</th><th>Tipo Pedido </th><th>Material</th><th>Cantidad</th><th>Fecha Pedido </th> <th>Comentario </th> <th>Vin </th>";

			console.log(json);
			for (var i = 0; i < json.length; i++) {
				if (json[i].Vin === "" || json[i].Vin === undefined) {
					json[i].Vin = "";
				}
				var dato = "<tr><td>" + json[i].Pedido + "</td><td>" + json[i].Pedidodealer + "</td><td>" + json[i].Nombre +
					"</td><td>" + json[i].Tipo + "</td><td>" + json[i].Descripcion + "</td><td>" + json[i].Cantidad +
					"<td>" + json[i].Fecha + "</td><td>" + json[i].Remito + "</td><td>" + json[i].Vin + "</td></tr> ";
				datos = datos + dato;
			}
			//	var datos = datos + dato
			var contexto = titulo + cuerpo + datos + final;
			//	console.log(contexto);
			t.envio(contexto);
		},
		envio: function (contexto) {
			t.popCarga();
			var arr = [];
			var json = {
				"root": {
					"strmailto": oView.byId("mail").getValue(),
					"strmailcc": "",
					"strsubject": oView.byId("descrpcion").getValue(),
					"strbody": contexto
				}
			};
			var arrjson = JSON.stringify(json);
            var appid = this.getOwnerComponent().getManifestEntry("/sap.app/id").replaceAll(".","/");
            var appModulePath = jQuery.sap.getModulePath(appid);
			$.ajax({
				type: 'POST',
				url:appModulePath + '/destinations/AR_DP_DEST_CPI/http/AR/DealerPortal/Mail',
				contentType: 'application/json; charset=utf-8',
				dataType: 'json',
				async: true,
				data: arrjson,
				success: function (dataR, textStatus, jqXHR) {

				},
				error: function (jqXHR, textStatus, errorThrown) {

					t.cerrarPopCarga2();

					var obj2 = {
						codigo: "200",
						descripcion: "Correo enviado exitosamente"
					};
					var arr2 = [];
					arr2.push(obj2);
					t.popSuccesCorreo(arr2, "Pedido Creado Exitosamente");
					oView.byId("mail").setValue();
					oView.byId("descrpcion").setValue();
				}
			});
			//	codigoeliminar = "";
		},

		//***********************fin correo

		onSalir: function () {
			var oCrossAppNavigator = sap.ushell.Container.getService("CrossApplicationNavigation");
			oCrossAppNavigator.toExternal({
				target: {
					shellHash: "#"
				}
			});
		},

		popCarga: function () {
			var oDialog = oView.byId("indicadorCarga");
			// create dialog lazily
			if (!oDialog) {
				// create dialog via fragment factory
				oDialog = sap.ui.xmlfragment(oView.getId(), "AR_DP_REP_REPORTESEGUIMIENTOVOR_EXPO.AR_DP_REP_REPORTESEGUIMIENTOVOR_EXPO.view.PopUp", this);
				oView.addDependent(oDialog);
			}
			oDialog.open();
			//	oView.byId("textCarga").setText(titulo);
		},
		cerrarPopCarga2: function () {
			oView.byId("indicadorCarga").close();
		},
		popSuccesCorreo: function (obj, titulo) {
			var oDialog = oView.byId("SuccesCorreo");
			var log = new sap.ui.model.json.JSONModel(obj);
			oView.setModel(log, "Succes");
			// create dialog lazily
			if (!oDialog) {
				// create dialog via fragment factory
				oDialog = sap.ui.xmlfragment(oView.getId(), "AR_DP_REP_REPORTESEGUIMIENTOVOR_EXPO.AR_DP_REP_REPORTESEGUIMIENTOVOR_EXPO.view.SuccesCorreo",
					this); //aqui se debe cambiar ar_dp_rep
				oView.addDependent(oDialog);
			}
			oView.byId("SuccesCorreo").addStyleClass(this.getOwnerComponent().getContentDensityClass());
			oDialog.open();
			oView.byId("SuccesCorreo").setTitle(" " + titulo);
			//	oView.byId("dialogSucces").setState("Succes");
		},
		cerrarPopSuccesCorreo: function () {
			oView.byId("SuccesCorreo").close();
			//	t.limpiezacorreo();
			t.cerrarEnvioCorreo();
		},
		downloadExcel: sap.m.Table.prototype.exportData || function () {
			var oModel = oView.getModel("pedidos");

			console.log(oModel);
			var PEDIDO = {
				name: "PEDIDO",
				template: {
					content: "{Pedido}"
				}
			};

			var PEDIDO_DEALER = {
				name: "PEDIDO_DEALER",
				template: {
					content: "{Pedidodealer}"
				}
			};

			var DEALER = {
				name: "DEALER",
				template: {
					content: "{Nombre}"
				}
			};

			var SOLICITANTE = {
				name: "SOLICITANTE",
				template: {
					content: "{Nombre}"
				}
			};

			var CANTIDAD = {
				name: "CANTIDAD",
				template: {
					content: "{Cantidad}"
				}
			};

			var DESTINATARIO = {
				name: "DESTINATARIO",
				template: {
					content: "{Destinatario}"
				}
			};
			var FECHA = {
				name: "FECHA",
				template: {
					content: "{Fecha}"
				}
			};

			var MATERIAL = {
				name: "MATERIAL",
				template: {
					content: "{Material} {Descripcion}"
				}
			};

			var REMITO = {
				name: "COMENTARIOS",
				template: {
					content: "{Remito}"
				}
			};

			var TIPO = {
				name: "TIPO",
				template: {
					content: "{Tipo}"
				}
			};
			var VIN = {
				name: "VIN",
				template: {
					content: "'{Vin}"
				}
			};

			var oExport = new Export({

				exportType: new ExportTypeCSV({
					fileExtension: "csv",
					separatorChar: ";"
				}),

				models: oModel,

				rows: {
					path: "/"
				},
				columns: [
					PEDIDO,
					PEDIDO_DEALER,
					DEALER,
					SOLICITANTE,
					DESTINATARIO,
					TIPO,
					MATERIAL,
					CANTIDAD,
					FECHA,
					REMITO,
					VIN
				]
			});
			oExport.saveFile("Listado Pedidos VOR").catch(function (oError) {

			}).then(function () {
				oExport.destroy();
				//	console.log("esto es una maravilla");
			});

		}

	});
});
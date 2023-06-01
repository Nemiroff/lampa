(function () {
    'use strict';
    function semverCompare(a, b) {
      if (a.startsWith(b + "-")) return -1;
      if (b.startsWith(a + "-")) return 1;
      return a.localeCompare(b, undefined, {
        numeric: true,
        sensitivity: "case",
        caseFirst: "upper"
      });
    }

    function startUpdater() {
      window.updater = true;
      var modal;
      var network = new Lampa.Reguest();
      var started = false;

      if (Lampa.Platform.is("android")) {
        var addToSettings = function addToSettings() {
          if (Lampa.Settings.main && !Lampa.Settings.main().render().find('[data-component="updater"]').length) {
            var field = $("<div class=\"settings-folder selector\" data-component=\"updater\">\n                    <div class=\"settings-folder__icon\"><svg height=\"46\" viewBox=\"0 0 32 32\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\"><g><path style=\"fill:white;\" d=\"M25.883,6.086l-2.82,2.832C24.953,10.809,26,13.324,26,16c0,5.516-4.484,10-10,10v-2l-4,4l4,4v-2c7.719,0,14-6.281,14-14C30,12.254,28.539,8.734,25.883,6.086z\"/><path style=\"fill:white;\" d=\"M20,4l-4-4v2C8.281,2,2,8.281,2,16c0,3.746,1.461,7.266,4.117,9.914l2.82-2.832C7.047,21.191,6,18.676,6,16c0-5.516,4.484-10,10-10v2L20,4z\"/></g></svg></div>\n                    <div class=\"settings-folder__name\">\u041E\u0431\u043D\u043E\u0432\u043B\u0435\u043D\u0438\u0435</div>\n                </div>");
            Lampa.Settings.main().render().find('[data-component="account"]').after(field);
            Lampa.Settings.main().update();
          }

          if (Lampa.Storage.get("updater_auto", false)) {
            if (isLampaTV) {
              setTimeout(function () {
                checkUpdate(true);
              }, 2000);
            }
          }
        };

        var checkUpdate = function checkUpdate() {
          var autoCheck = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
          network.clear();
          network.timeout(10000);
          network['native']("http://nemiroff.github.io/lampa/apk/info.json", function (found) {
            if (found) {
              if (semverCompare(found.version, current_version) > 0) {
                if (autoCheck) {
                  Lampa.Noty.show("Доступно обновление клиента Lampa TV");
                } else {
                  modal = $('<div>' + '<div class="broadcast__text">' + found.changelog + '</div>' + '<div class="broadcast__scan hide"><div></div></div>' + '<div class="broadcast__device selector" style="text-align: center">Скачать v' + found.version + '</div>' + '</div>');
                  Lampa.Modal.open({
                    title: 'Новая версия',
                    html: modal,
                    onBack: function onBack() {
                      Lampa.Modal.close();
                      Lampa.Controller.toggle('settings_component');
                    },
                    onSelect: function onSelect() {
                      if (semverCompare(current_version, "7.7.7-98") < 0) {
                        Lampa.Noty.show("Для данной версии нет поддержки автообновления. Обновите вручную.");
                      } else {
                        if (!started) {
                          started = true;
                          $('<a href="' + found.file_url + '"><a/>')[0].click();
                        }
                      }
                    }
                  });
                }
              } else {
                if (!autoCheck) {
                  Lampa.Controller.toggle('settings_component');
                  Lampa.Noty.show("У вас установлена последняя версия!");
                }
              }
            } else {
              Lampa.Noty.show(found);
            }
          }, function (a, c) {
            Lampa.Noty.show(network.errorDecode(a, c));
          });
        };

        var current_version = typeof AndroidJS !== "undefined" ? AndroidJS.appVersion() : "7.7.7-77";
        var isLampaTV = current_version.startsWith("7.");
        Lampa.Params.trigger("updater_auto", false);
        Lampa.Template.add('settings_updater', "<div><div class=\"settings-param selector\" data-type=\"toggle\" data-name=\"updater_auto\"><div class=\"settings-param__name\">\u0410\u0432\u0442\u043E\u043C\u0430\u0442\u0438\u0447\u0435\u0441\u043A\u0438</div><div class=\"settings-param__value\"></div><div class=\"settings-param__descr\">\u041F\u0440\u0438 \u0437\u0430\u043F\u0443\u0441\u043A\u0435 \u043F\u0440\u0438\u043B\u043E\u0436\u0435\u043D\u0438\u044F, \u043F\u0440\u043E\u0432\u0435\u0440\u044F\u0442\u044C \u043D\u0430 \u043D\u0430\u043B\u0438\u0447\u0438\u0435 \u043D\u043E\u0432\u043E\u0439 \u0432\u0435\u0440\u0441\u0438\u0438</div></div><div class=\"settings-param selector\" data-name=\"updater_check\" data-static=\"true\"><div class=\"settings-param__name\">\u041F\u0440\u043E\u0432\u0435\u0440\u0438\u0442\u044C</div><div class=\"settings-param__descr\">\u0422\u0435\u043A\u0443\u0449\u0430\u044F \u0432\u0435\u0440\u0441\u0438\u044F: ".concat(current_version, "</div></div></div>"));
        Lampa.Settings.listener.follow('open', function (e) {
          if (e.name === "updater") {
            e.body.find('[data-name="updater_check"]').unbind('hover:enter').on('hover:enter', function () {
              if (isLampaTV) checkUpdate();else Lampa.Noty.show("Похоже у вас стоит версия с автообновлением. Данный плагин вам не нужен.");
            });
          }
        });
        if (window.appready) addToSettings();else {
          Lampa.Listener.follow('app', function (e) {
            if (e.type == "ready") addToSettings();
          });
        }

        window.downloadStart = function (show) {
          if (show) modal.find('.broadcast__scan').removeClass('hide');else {
            started = false;
            modal.find('.broadcast__scan').addClass('hide');
            Lampa.Modal.close();
          }
        };
      }
    }

    if (!window.updater) startUpdater();
    if (Lampa.Storage.get('jackett_url').toUpperCase() == 'JACRED.CF') Lampa.Storage.set('jackett_url', 'jacred.ru')

})();

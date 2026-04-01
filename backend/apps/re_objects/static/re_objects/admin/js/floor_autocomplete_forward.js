'use strict';
{
    const $ = django.jQuery;

    function forwardBuildingAjaxData(element, forwardFieldId) {
        return (params) => {
            const data = {
                term: params.term,
                page: params.page,
                app_label: element.dataset.appLabel,
                model_name: element.dataset.modelName,
                field_name: element.dataset.fieldName,
            };
            const buildingEl = document.getElementById(forwardFieldId);
            if (buildingEl && buildingEl.value) {
                data.building = buildingEl.value;
            }
            return data;
        };
    }

    function initFloorAutocompleteForward() {
        $('.admin-autocomplete[data-forward-building]')
            .not('[name*=__prefix__]')
            .each(function () {
                const element = this;
                const forwardId = element.dataset.forwardBuilding;
                if (!forwardId) {
                    return;
                }
                const $el = $(element);
                if ($el.data('select2')) {
                    $el.select2('destroy');
                }
                $el.select2({
                    ajax: {
                        data: forwardBuildingAjaxData(element, forwardId),
                    },
                });
            });
    }

    $(function () {
        initFloorAutocompleteForward();

        const buildingSel = $('#id_building');
        if (buildingSel.length) {
            buildingSel.on('change', function () {
                const $floor = $('#id_floor');
                if ($floor.length && $floor.data('select2')) {
                    $floor.val(null).trigger('change');
                }
            });
        }
    });

    document.addEventListener('formset:added', () => {
        initFloorAutocompleteForward();
    });
}

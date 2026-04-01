"""
Виджеты админки для re_objects.
"""

from django import forms
from django.contrib.admin.widgets import AutocompleteSelect


class FloorByBuildingAutocompleteSelect(AutocompleteSelect):
    """
    Autocomplete этажа на форме помещения.

    В AJAX добавляется выбранное здание (JS + FloorAdmin.get_search_results).
    """

    def build_attrs(self, base_attrs, extra_attrs=None):
        attrs = super().build_attrs(base_attrs, extra_attrs)
        attrs['data-forward-building'] = 'id_building'
        # Иначе браузер/jQuery могут отдать закэшированный пустой ответ (запрос без building).
        attrs['data-ajax--cache'] = 'false'
        return attrs

    @property
    def media(self):
        return super().media + forms.Media(
            js=('re_objects/admin/js/floor_autocomplete_forward.js',),
        )

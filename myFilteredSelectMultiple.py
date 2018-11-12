from django import forms
from django.conf import settings

class myFilteredSelectMultiple(forms.SelectMultiple):
    template_name = 'myFilteredSelectMultiple/forms/widgets/myFilteredSelectMultiple.html'
    #option_template_name = 'myFilteredSelectMultiple/forms/widgets/myFilteredSelectMultiple_option.html'
    verbose_name = ""
    label_chooseall = "Choose all"
    title_choose = "Choose"
    label_choose = "Choose"
    title_remove = "Remove"
    label_remove = "Remove"
    label_removeall = "Remove all"

    def format_str_with(self, verbose_name):
        title_available = "Available {}"
        available_title_help_text = "This is the list of available {}. You may choose some by selecting them in the box below and then clicking the &quot;Choose&quot; arrow between the two boxes."
        available_input_help_text = "Type into this box to filter down the list of available {}."
        title_chooseall = "Click to choose all {} at once."
        title_chosen = "Chosen {}"
        chosen_title_help_text = "This is the list of chosen {}. You may remove some by selecting them in the box below and then clicking the &quot;Remove&quot; arrow between the two boxes."
        title_removeall = "Click to remove all chosen {} at once."
        self.title_available = title_available.format(verbose_name)
        self.available_title_help_text = available_title_help_text.format(verbose_name)
        self.available_input_help_text = available_input_help_text.format(verbose_name)
        self.title_chooseall = title_chooseall.format(verbose_name)
        self.title_chosen = title_chosen.format(verbose_name)
        self.chosen_title_help_text = chosen_title_help_text.format(verbose_name)
        self.title_removeall = title_removeall.format(verbose_name)
    
    def __init__(self, verbose_name, is_stacked, attrs=None, choices=()):
        self.verbose_name = verbose_name
        self.is_stacked = is_stacked
        self.format_str_with(verbose_name)
        super().__init__(attrs, choices)
       
    def get_context(self, name, value, attrs):
        context = super().get_context(name, value, attrs)
        context['widget']['id'] = self.id_for_label('id_'+context['widget']['name'])
        context['widget']['attrs'].pop('id', None)
        context['widget']['attrs'].pop('required', None)
        context['widget']['class'] = 'selector'
        context['widget']['attrs']['class'] = 'filtered'
        context['widget']['title_available'] = self.title_available
        context['widget']['available_title_help_text'] = self.available_title_help_text
        context['widget']['available_input_help_text'] = self.available_input_help_text
        context['widget']['title_chooseall'] = self.title_chooseall
        context['widget']['label_chooseall'] = self.label_chooseall
        context['widget']['label_choose'] = self.label_choose
        context['widget']['title_remove'] = self.title_remove
        context['widget']['label_remove'] = self.label_remove
        context['widget']['title_chosen'] = self.title_chosen
        context['widget']['chosen_title_help_text'] = self.chosen_title_help_text
        context['widget']['title_removeall'] = self.title_removeall
        context['widget']['label_removeall'] = self.label_removeall
        
        if self.allow_multiple_selected:
            context['widget']['attrs']['multiple'] = True
        if self.is_stacked:
            context['widget']['attrs']['class'] += 'stacked'
        context['widget']['attrs']['data-field-name'] = self.verbose_name
        context['widget']['attrs']['data-is-stacked'] = int(self.is_stacked)
        return context
        
    class Media:
        extend = False
        js = (settings.STATIC_URL + "admin/js/myFilteredSelectMultiple.js",
              )

         
## Default Field Rendering

[source: StackExchange](http://sharepoint.stackexchange.com/questions/112506/sharepoint-2013-js-link-return-default-field-rendering)

                    'Text': {
                        'View': RenderFieldValueDefault,
                        'DisplayForm': SPField_FormDisplay_Default,
                        'EditForm': SPFieldText_Edit,
                        'NewForm': SPFieldText_Edit
                    },
                    'Number': {
                        'View': RenderFieldValueDefault,
                        'DisplayForm': SPField_FormDisplay_Default,
                        'EditForm': SPFieldNumber_Edit,
                        'NewForm': SPFieldNumber_Edit
                    },
                    'Integer': {
                        'View': RenderFieldValueDefault,
                        'DisplayForm': SPField_FormDisplay_Default,
                        'EditForm': SPFieldNumber_Edit,
                        'NewForm': SPFieldNumber_Edit
                    },
                    'Boolean': {
                        'View': RenderFieldValueDefault,
                        'DisplayForm': SPField_FormDisplay_DefaultNoEncode,
                        'EditForm': SPFieldBoolean_Edit,
                        'NewForm': SPFieldBoolean_Edit
                    },
                    'Note': {
                        'View': RenderFieldValueDefault,
                        'DisplayForm': SPFieldNote_Display,
                        'EditForm': SPFieldNote_Edit,
                        'NewForm': SPFieldNote_Edit
                    },
                    'Currency': {
                        'View': RenderFieldValueDefault,
                        'DisplayForm': SPField_FormDisplay_Default,
                        'EditForm': SPFieldNumber_Edit,
                        'NewForm': SPFieldNumber_Edit
                    },
                    'File': {
                        'View': RenderFieldValueDefault,
                        'DisplayForm': SPFieldFile_Display,
                        'EditForm': SPFieldFile_Edit,
                        'NewForm': SPFieldFile_Edit
                    },
                    'Calculated': {
                        'View': RenderFieldValueDefault,
                        'DisplayForm': SPField_FormDisplay_Default,
                        'EditForm': SPField_FormDisplay_Empty,
                        'NewForm': SPField_FormDisplay_Empty
                    },
                    'Choice': {
                        'View': RenderFieldValueDefault,
                        'DisplayForm': SPField_FormDisplay_Default,
                        'EditForm': SPFieldChoice_Edit,
                        'NewForm': SPFieldChoice_Edit
                    },
                    'MultiChoice': {
                        'View': RenderFieldValueDefault,
                        'DisplayForm': SPField_FormDisplay_Default,
                        'EditForm': SPFieldMultiChoice_Edit,
                        'NewForm': SPFieldMultiChoice_Edit
                    },
                    'Lookup': {
                        'View': RenderFieldValueDefault,
                        'DisplayForm': SPFieldLookup_Display,
                        'EditForm': SPFieldLookup_Edit,
                        'NewForm': SPFieldLookup_Edit
                    },
                    'LookupMulti': {
                        'View': RenderFieldValueDefault,
                        'DisplayForm': SPFieldLookup_Display,
                        'EditForm': SPFieldLookup_Edit,
                        'NewForm': SPFieldLookup_Edit
                    },
                    'Computed': {
                        'View': RenderFieldValueDefault,
                        'DisplayForm': SPField_FormDisplay_Default,
                        'EditForm': SPField_FormDisplay_Default,
                        'NewForm': SPField_FormDisplay_Default
                    },
                    'URL': {
                        'View': RenderFieldValueDefault,
                        'DisplayForm': SPFieldUrl_Display,
                        'EditForm': SPFieldUrl_Edit,
                        'NewForm': SPFieldUrl_Edit
                    },
                    'User': {
                        'View': RenderFieldValueDefault,
                        'DisplayForm': SPFieldUser_Display,
                        'EditForm': SPClientPeoplePickerCSRTemplate,
                        'NewForm': SPClientPeoplePickerCSRTemplate
                    },
                    'UserMulti': {
                        'View': RenderFieldValueDefault,
                        'DisplayForm': SPFieldUserMulti_Display,
                        'EditForm': SPClientPeoplePickerCSRTemplate,
                        'NewForm': SPClientPeoplePickerCSRTemplate
                    },
                    'DateTime': {
                        'View': RenderFieldValueDefault,
                        'DisplayForm': SPFieldDateTime_Display,
                        'EditForm': SPFieldDateTime_Edit,
                        'NewForm': SPFieldDateTime_Edit
                    },
                    'Attachments': {
                        'View': RenderFieldValueDefault,
                        'DisplayForm': SPFieldAttachments_Default,
                        'EditForm': SPFieldAttachments_Default,
                        'NewForm': SPFieldAttachments_Default
                    }
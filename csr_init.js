/**
 * Created by administrator on 23-1-2016.
 */


/**
 * Development, re-execute Cisar Live Editting
 */
SP.SOD.registerSod("iCSR", 'https://365csi.nl/iCSR/iCSR.js');
function execCSR() {
    window.iCSR || SP.SOD.executeFunc("iCSR", null, execCSR );
    SP.SOD.executeFunc("clienttemplates.js", "SPClientTemplates", function() {
        console.clear();
        function init() {
            window.iCSR || window.setTimeout(execCSR,50);
            SPClientTemplates.TemplateManager.RegisterTemplateOverrides({
                Templates: {
                    Fields: {
                        "Priority": {
                            View: iCSR.Me
                        },
                        "Status": {
                            View: iCSR.Me.bind({colors:"lightcoral,limegreen,grey,wheat,pink"})
                        },
                        "DueDate": {
                            View: iCSR.Template.DueDate
                        },
                        "PercentComplete":{
                            View: iCSR.Me.bind({barcolor:'#0072C6',color:'beige'})
                        }
                    }//Fields
                },//Templates
                ListTemplateType: 171
            });
        }//init
        RegisterModuleInit(SPClientTemplates.Utility.ReplaceUrlTokens("~siteCollection/Style Library/csr_test.js"), init);
        init();
    });
};
execCSR();
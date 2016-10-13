import {Template} from 'meteor/templating';
import {AutoForm} from 'meteor/aldeed:autoform';
import {Roles} from  'meteor/alanning:roles';
import {alertify} from 'meteor/ovcharik:alertifyjs';
import {sAlert} from 'meteor/juliancwirko:s-alert';
import {fa} from 'meteor/theara:fa-helpers';
import {lightbox} from 'meteor/theara:lightbox-helpers';
import {TAPi18n} from 'meteor/tap:i18n';
import {ReactiveTable} from 'meteor/aslagle:reactive-table';
import {moment} from 'meteor/momentjs:moment';

// Lib
import {createNewAlertify} from '../../../core/client/libs/create-new-alertify.js';
import {reactiveTableSettings} from '../../../core/client/libs/reactive-table-settings.js';
import {renderTemplate} from '../../../core/client/libs/render-template.js';
import {destroyAction} from '../../../core/client/libs/destroy-action.js';
import {displaySuccess, displayError} from '../../../core/client/libs/display-alert.js';
import {__} from '../../../core/common/libs/tapi18n-callback-helper.js';

// Component
import '../../../core/client/components/loading.js';
import '../../../core/client/components/column-action.js';
import '../../../core/client/components/form-footer.js';

// Collection
import {CaseHistory} from '../../common/collections/case-history.js';

// Tabular
import {CaseHistoryTabular} from '../../common/tabulars/case-history.js';

// Page
import './case-history.html';

// Declare template
let indexTmpl = Template.Dental_caseHistory,
    formTmpl = Template.Dental_caseHistoryForm,
    showTmpl = Template.Dental_caseHistoryShow;


// Index
indexTmpl.onCreated(function () {
    // Create new  alertify
    createNewAlertify('caseHistory', {size: 'sm'});
    createNewAlertify('caseHistoryShow',);
});

indexTmpl.helpers({
    tabularTable(){
        return CaseHistoryTabular;
    },
    selector() {
        return {branchId: Session.get('currentByBranch')};
    }
});

indexTmpl.events({
    'click .js-create' (event, instance) {
        alertify.caseHistory(fa('plus', 'Case History'), renderTemplate(formTmpl));
    },
    'click .js-update' (event, instance) {
        alertify.caseHistory(fa('pencil', 'Case History'), renderTemplate(formTmpl, {caseHistoryId: this._id}));
    },
    'click .js-destroy' (event, instance) {
        destroyAction(
            CaseHistory,
            {_id: this._id},
            {title: 'Case History', itemTitle: this._id}
        );
    },
    'click .js-display' (event, instance) {
        alertify.caseHistoryShow(fa('eye', 'Case History'), renderTemplate(showTmpl, {caseHistoryId: this._id}));
    }
});

// Form
formTmpl.onCreated(function () {
    this.autorun(()=> {

        let currentData = Template.currentData();
        if (currentData) {
            this.subscribe('dental.caseHistoryById', currentData.caseHistoryId);
        }
    });
});

formTmpl.helpers({
    collection(){
        return CaseHistory;
    },
    data () {
        let data = {
            formType: 'insert',
            doc: {}
        };
        let currentData = Template.currentData();

        if (currentData) {
            data.formType = 'update';
            data.doc = CaseHistory.findOne(currentData.caseHistoryId);
        }

        return data;
    },
    checkForDescriptionField() {
        if(FlowRouter.current().route.name == "dental.caseHistory"){
            return true;
        }
    }
});

// Show
showTmpl.onCreated(function () {
    this.autorun(()=> {
        let currentData = Template.currentData();
        this.subscribe('dental.caseHistoryById', currentData.caseHistoryId);
    });
});

showTmpl.helpers({
    data () {
        let currentData = Template.currentData();
        return CaseHistory.findOne(currentData.caseHistoryId);
    }
});

// Hook
let hooksObject = {
    onSuccess (formType, result) {
        if (formType == 'update') {
            alertify.caseHistory().close();
        }
        displaySuccess();
    },
    onError (formType, error) {
        displayError(error.message);
    }
};

AutoForm.addHooks(['Dental_caseHistoryForm'], hooksObject);

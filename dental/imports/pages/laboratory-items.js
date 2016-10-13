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
import {LaboratoryItems} from '../../common/collections/laboratory-items.js';

// Tabular
import {LaboratoryItemsTabular} from '../../common/tabulars/laboratory-items.js';

// Page
import './laboratory-items.html';

// Declare template
let indexTmpl = Template.Dental_laboratoryItems,
    formTmpl = Template.Dental_laboratoryItemsForm,
    showTmpl = Template.Dental_laboratoryItemsShow;


// Index
indexTmpl.onCreated(function () {
    // Create new  alertify
    createNewAlertify('laboratoryItems', {size: 'sm'});
    createNewAlertify('laboratoryItemsShow',);
});

indexTmpl.helpers({
    tabularTable(){
        return LaboratoryItemsTabular;
    },
    selector() {
        return {branchId: Session.get('currentByBranch')};
    }
});

indexTmpl.events({
    'click .js-create' (event, instance) {
        alertify.laboratoryItems(fa('plus', 'Laboratory Items'), renderTemplate(formTmpl));
    },
    'click .js-update' (event, instance) {
        alertify.laboratoryItems(fa('pencil', 'Laboratory Items'), renderTemplate(formTmpl, {laboratoryItemsId: this._id}));
    },
    'click .js-destroy' (event, instance) {
        destroyAction(
            LaboratoryItems,
            {_id: this._id},
            {title: 'Laboratory Items', itemTitle: this._id}
        );
    },
    'click .js-display' (event, instance) {
        alertify.laboratoryItemsShow(fa('eye', 'Laboratory Items'), renderTemplate(showTmpl, {laboratoryItemsId: this._id}));
    }
});


// Form
formTmpl.onCreated(function () {
    this.autorun(()=> {

        let currentData = Template.currentData();
        this.subscribe('dental.laboratoryCategories');
        if (currentData) {
            this.subscribe('dental.laboratoryItemsById', currentData.laboratoryItemsId);
        }
    });
});

formTmpl.helpers({
    collection(){
        return LaboratoryItems;
    },
    data () {
        let data = {
            formType: 'insert',
            doc: {}
        };
        let currentData = Template.currentData();

        if (currentData) {
            data.formType = 'update';
            data.doc = LaboratoryItems.findOne(currentData.laboratoryItemsId);
        }

        return data;
    }
});

// Show
showTmpl.onCreated(function () {
    this.autorun(()=> {
        let currentData = Template.currentData();
        this.subscribe('dental.laboratoryItemsById', currentData.laboratoryItemsId);
    });
});

showTmpl.helpers({
    data () {
        let currentData = Template.currentData();
        return LaboratoryItems.findOne(currentData.laboratoryItemsId);
    }
});

// Hook
let hooksObject = {
    onSuccess (formType, result) {
        if (formType == 'update') {
            alertify.laboratoryItems().close();
        }
        displaySuccess();
    },
    onError (formType, error) {
        displayError(error.message);
    }
};

AutoForm.addHooks(['Dental_laboratoryItemsForm'], hooksObject);

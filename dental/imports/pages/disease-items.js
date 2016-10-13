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
import {DiseaseItems} from '../../common/collections/disease-items.js';

// Tabular
import {DiseaseItemsTabular} from '../../common/tabulars/disease-items.js';

// Page
import './disease-items.html';

// Declare template
let indexTmpl = Template.Dental_diseaseItems,
    formTmpl = Template.Dental_diseaseItemsForm,
    showTmpl = Template.Dental_diseaseItemsShow;


// Index
indexTmpl.onCreated(function () {
    // Create new  alertify
    createNewAlertify('diseaseItems', {size: 'lg'});
    createNewAlertify('diseaseItemsShow',);
});

indexTmpl.helpers({
    tabularTable(){
        return DiseaseItemsTabular;
    },
    selector() {
        return {branchId: Session.get('currentByBranch')};
    }
});

indexTmpl.events({
    'click .js-create' (event, instance) {
        alertify.diseaseItems(fa('plus', 'Disease Items'), renderTemplate(formTmpl));
    },
    'click .js-update' (event, instance) {
        alertify.diseaseItems(fa('pencil', 'Disease Items'), renderTemplate(formTmpl, {diseaseItemsId: this._id}));
    },
    'click .js-destroy' (event, instance) {
        destroyAction(
            DiseaseItems,
            {_id: this._id},
            {title: 'Disease Items', itemTitle: this._id}
        );
    },
    'click .js-display' (event, instance) {
        alertify.diseaseItemsShow(fa('eye', 'Disease Items'), renderTemplate(showTmpl, {diseaseItemsId: this._id}));
    }
});


// Form
formTmpl.onCreated(function () {
    this.autorun(()=> {

        let currentData = Template.currentData();
        this.subscribe('dental.diseaseCategories');
        if (currentData) {
            this.subscribe('dental.diseaseItemsById', currentData.diseaseItemsId);
        }
    });
});

formTmpl.helpers({
    collection(){
        return DiseaseItems;
    },
    data () {
        let data = {
            formType: 'insert',
            doc: {}
        };
        let currentData = Template.currentData();

        if (currentData) {
            data.formType = 'update';
            data.doc = DiseaseItems.findOne(currentData.diseaseItemsId);
        }

        return data;
    }
});

// Show
showTmpl.onCreated(function () {
    this.autorun(()=> {
        let currentData = Template.currentData();
        this.subscribe('dental.diseaseItemsById', currentData.diseaseItemsId);
    });
});

showTmpl.helpers({
    data () {
        let currentData = Template.currentData();
        return DiseaseItems.findOne(currentData.diseaseItemsId);
    }
});

// Hook
let hooksObject = {
    onSuccess (formType, result) {
        if (formType == 'update') {
            alertify.diseaseItems().close();
        }
        displaySuccess();
    },
    onError (formType, error) {
        displayError(error.message);
    }
};

AutoForm.addHooks(['Dental_diseaseItemsForm'], hooksObject);

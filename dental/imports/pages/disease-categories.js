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
import {DiseaseCategories} from '../../common/collections/disease-categories.js';

// Tabular
import {DiseaseCategoriesTabular} from '../../common/tabulars/disease-categories.js';

// Page
import './disease-categories.html';

// Declare template
let indexTmpl = Template.Dental_diseaseCategories,
    formTmpl = Template.Dental_diseaseCategoriesForm,
    showTmpl = Template.Dental_diseaseCategoriesShow;


// Index
indexTmpl.onCreated(function () {
    // Create new  alertify
    createNewAlertify('diseaseCategories', {size: 'sm'});
    createNewAlertify('diseaseCategoriesShow',);
});

indexTmpl.helpers({
    tabularTable(){
        return DiseaseCategoriesTabular;
    },
    selector() {
        return {branchId: Session.get('currentByBranch')};
    }
});

indexTmpl.events({
    'click .js-create' (event, instance) {
        alertify.diseaseCategories(fa('plus', 'Disease Categories'), renderTemplate(formTmpl));
    },
    'click .js-update' (event, instance) {
        alertify.diseaseCategories(fa('pencil', 'Disease Categories'), renderTemplate(formTmpl, {diseaseCategoriesId: this._id}));
    },
    'click .js-destroy' (event, instance) {
        destroyAction(
            DiseaseCategories,
            {_id: this._id},
            {title: 'Disease Categories', itemTitle: this._id}
        );
    },
    'click .js-display' (event, instance) {
        alertify.diseaseCategoriesShow(fa('eye', 'Disease Categories'), renderTemplate(showTmpl, {diseaseCategoriesId: this._id}));
    }
});


// Form
formTmpl.onCreated(function () {
    this.autorun(()=> {

        let currentData = Template.currentData();
        if (currentData) {
            this.subscribe('dental.diseaseCategoriesById', currentData.diseaseCategoriesId);
        }
    });
});

formTmpl.helpers({
    collection(){
        return DiseaseCategories;
    },
    data () {
        let data = {
            formType: 'insert',
            doc: {}
        };
        let currentData = Template.currentData();

        if (currentData) {
            data.formType = 'update';
            data.doc = DiseaseCategories.findOne(currentData.diseaseCategoriesId);
        }

        return data;
    },
    checkForDescriptionField() {
        if(FlowRouter.current().route.name == "dental.diseaseCategories"){
            return true;
        }
    }
});

// Show
showTmpl.onCreated(function () {
    this.autorun(()=> {
        let currentData = Template.currentData();
        this.subscribe('dental.diseaseCategoriesById', currentData.diseaseCategoriesId);
    });
});

showTmpl.helpers({
    data () {
        let currentData = Template.currentData();
        return DiseaseCategories.findOne(currentData.diseaseCategoriesId);
    }
});

// Hook
let hooksObject = {
    onSuccess (formType, result) {
        if (formType == 'update') {
            alertify.diseaseCategories().close();
        }
        displaySuccess();
    },
    onError (formType, error) {
        displayError(error.message);
    }
};

AutoForm.addHooks(['Dental_diseaseCategoriesForm'], hooksObject);

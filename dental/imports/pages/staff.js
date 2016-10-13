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
import {Staff} from '../../common/collections/staff.js';

// Tabular
import {StaffTabular} from '../../common/tabulars/staff.js';

// Page
import './staff.html';

// Declare template
let indexTmpl = Template.Dental_staff,
    contactTmpl = Template.Dental_staffContact,
    formTmpl = Template.Dental_staffForm,
    showTmpl = Template.Dental_staffShow;


// Index
indexTmpl.onCreated(function () {
    // Create new  alertify
    createNewAlertify('staff', {size: 'lg'});
    createNewAlertify('staffShow',);
});

indexTmpl.helpers({
    tabularTable(){
        return StaffTabular;
    },
    selector() {
        return {branchId: Session.get('currentByBranch')};
    }
});

indexTmpl.events({
    'click .js-create' (event, instance) {
        alertify.staff(fa('plus', 'Staff'), renderTemplate(formTmpl));
    },
    'click .js-update' (event, instance) {
        alertify.staff(fa('pencil', 'Staff'), renderTemplate(formTmpl, {staffId: this._id}));
    },
    'click .js-destroy' (event, instance) {
        destroyAction(
            Staff,
            {_id: this._id},
            {title: 'Staff', itemTitle: this._id}
        );
    },
    'click .js-display' (event, instance) {
        alertify.staffShow(fa('eye', 'Staff'), renderTemplate(showTmpl, {staffId: this._id}));
    }
});

// Contact tabular
contactTmpl.helpers({
    jsonViewOpts () {
        return {collapsed: true};
    }
});

// Form
formTmpl.onCreated(function () {
    this.autorun(()=> {
        // Lookup value
        this.subscribe('dental.lookupValueByNames', ['Gender','Position', 'Contact Type']);

        let currentData = Template.currentData();
        if (currentData) {
            this.subscribe('dental.staffById', currentData.staffId);
        }
    });
});

formTmpl.helpers({
    collection(){
        return Staff;
    },
    data () {
        let data = {
            formType: 'insert',
            doc: {}
        };
        let currentData = Template.currentData();

        if (currentData) {
            data.formType = 'update';
            data.doc = Staff.findOne(currentData.staffId);
        }

        return data;
    }
});

// Show
showTmpl.onCreated(function () {
    this.autorun(()=> {
        let currentData = Template.currentData();
        this.subscribe('dental.staffById', currentData.staffId);
    });
});

showTmpl.helpers({
    data () {
        let currentData = Template.currentData();
        return Staff.findOne(currentData.staffId);
    }
});

// Hook
let hooksObject = {
    onSuccess (formType, result) {
        if (formType == 'update') {
            alertify.staff().close();
        }
        displaySuccess();
    },
    onError (formType, error) {
        displayError(error.message);
    }
};

AutoForm.addHooks(['Dental_staffForm'], hooksObject);

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

// Method
import {lookupRegister} from '../../common/methods/lookup-register';

// Collection
import {Deposit} from '../../common/collections/deposit.js';

// Tabular
import {DepositTabular} from '../../common/tabulars/deposit.js';

// Page
import './deposit.html';
import './deposit-items.js';

// Local collection
let depositItemsCollection = new Mongo.Collection(null);

// Declare template
let indexTmpl = Template.Dental_deposit,
    itemsTmpl = Template.Dental_depositItem,
    formTmpl = Template.Dental_depositForm,
    showTmpl = Template.Dental_depositShow;


// Index
indexTmpl.onCreated(function () {
    // Create new  alertify
    createNewAlertify('deposit', {size: 'lg'});
    createNewAlertify('depositShow',);
});

indexTmpl.helpers({
    tabularTable(){
        return DepositTabular;
    },
    selector() {
        return {branchId: Session.get('currentByBranch')};
    }
});

indexTmpl.events({
    'click .js-create' (event, instance) {
        alertify.deposit(fa('plus', 'Deposit'), renderTemplate(formTmpl)).maximize();
    },
    'click .js-update' (event, instance) {
        alertify.deposit(fa('pencil', 'Deposit'), renderTemplate(formTmpl, {depositId: this._id}));
    },
    'click .js-destroy' (event, instance) {
        destroyAction(
            Deposit,
            {_id: this._id},
            {title: 'Deposit', itemTitle: this._id}
        );
    },
    'click .js-display' (event, instance) {
        alertify.depositShow(fa('eye', 'Deposit'), renderTemplate(showTmpl, {depositId: this._id}));
    }
});

// items tabular
itemsTmpl.helpers({
    jsonViewOpts () {
        return {collapsed: true};
    }
});

// Form
formTmpl.onCreated(function () {

    // Lookup value
    // this.subscribe('dental.lookupValueByNames', ['Gender', 'Contact Type']);
    //
    // let currentData = Template.currentData();
    // if (currentData) {
    //     this.subscribe('dental.depositById', currentData.depositId);
    // }

    let registerId = FlowRouter.getQueryParam("registerId");

    let self = this;
    self.registerDoc = new ReactiveVar();

    self.autorun(()=> {
        lookupRegister.callPromise({
            registerId: registerId
        }).then((result)=> {
            self.registerDoc.set(result);
        }).catch((err)=> {
            console.log(err);
        });

    });
});

formTmpl.helpers({
    collection(){
        return Deposit;
    },
    depositItemsCollection(){
        return depositItemsCollection;
    },
    registerDoc(){
        return Template.instance().registerDoc.get();
    },
    data () {
        let registerDoc = Template.instance().registerDoc.get();

        let data = {
            formType: 'insert',
            doc: {
                registerId: registerDoc._id,
                patientId: registerDoc.patientId,
                dueAmount: registerDoc.total
            }
        };

        let currentData = Template.currentData();

        if (currentData) {
            data.formType = 'update';
            data.doc = Deposit.findOne(currentData.depositId);
        }

        return data;
    }
});

formTmpl.onDestroyed(function () {
    // Remove items collection
    depositItemsCollection.remove({});
});

// Show
showTmpl.onCreated(function () {
    this.autorun(()=> {
        let currentData = Template.currentData();
        this.subscribe('dental.depositById', currentData.depositId);
    });
});

showTmpl.helpers({
    data () {
        let currentData = Template.currentData();
        return Deposit.findOne(currentData.depositId);
    }
});

// Hook
let hooksObject = {
    before: {
        insert: function (doc) {
            // let depositItems = Session.get('depositItemsCollection');
            doc.items = depositItemsCollection.find().fetch();
            return doc;
        },
        update: function (doc) {
            doc.$set.items = depositItemsCollection.find().fetch();
            delete doc.$unset;
            return doc;
        }
    },
    onSuccess (formType, result) {
        if (formType == 'update') {
            alertify.deposit().close();
        }
        // Remove items collection
        depositItemsCollection.remove({});

        displaySuccess();
    },
    onError (formType, error) {
        displayError(error.message);
    }
};

AutoForm.addHooks(['Dental_depositForm'], hooksObject);

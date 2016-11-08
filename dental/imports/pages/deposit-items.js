import {Template} from 'meteor/templating';
import {ReactiveVar} from 'meteor/reactive-var';
import {AutoForm} from 'meteor/aldeed:autoform';
import {Roles} from  'meteor/alanning:roles';
import {alertify} from 'meteor/ovcharik:alertifyjs';
import {sAlert} from 'meteor/juliancwirko:s-alert';
import {fa} from 'meteor/theara:fa-helpers';
import {lightbox} from 'meteor/theara:lightbox-helpers';
import {_} from 'meteor/erasaur:meteor-lodash';
import {$} from 'meteor/jquery';
import {TAPi18n} from 'meteor/tap:i18n';
import {ReactiveTable} from 'meteor/aslagle:reactive-table';

// Lib
import {createNewAlertify} from '../../../core/client/libs/create-new-alertify.js';
import {renderTemplate} from '../../../core/client/libs/render-template.js';
import {destroyAction} from '../../../core/client/libs/destroy-action.js';
import {displaySuccess, displayError, displayWarning} from '../../../core/client/libs/display-alert.js';
import {reactiveTableSettings} from '../../../core/client/libs/reactive-table-settings.js';
import {__} from '../../../core/common/libs/tapi18n-callback-helper.js';

// Component
import '../../../core/client/components/loading.js';
import '../../../core/client/components/column-action.js';
import '../../../core/client/components/form-footer.js';

// Method
import {lookupDiseaseItems} from '../../common/methods/lookup-disease-items.js';

// Collection
import {DepositItemsSchema} from '../../common/collections/deposit-items.js';

// Method
// import {lookupRegister} from '../../common/methods/lookup-register';
import {lookupDeposit} from '../../common/methods/lookup-deposit';


// Page
import './deposit-items.html';

// Declare template
let indexTmpl = Template.Dental_depositItems,
    actionTmpl = Template.Dental_depositItemsAction,
    newTmpl = Template.Dental_depositItemsNew,
    editTmpl = Template.Dental_depositItemsEdit;

// Local collection
var depositItemsCollection;

// Index
indexTmpl.onCreated(function () {
    // Create new  alertify
    createNewAlertify('item', {size: 'lg'});

    this.subDiscount = new ReactiveVar(0);

    // Data context
    let data;

    if (Template.currentData()) {
        data = Template.currentData();
    }
    depositItemsCollection = data.depositItemsCollection;
});

indexTmpl.helpers({
    tableSettings: function () {
        let i18nPrefix = 'dental.deposit.schema';

        reactiveTableSettings.showFilter = false;
        reactiveTableSettings.showNavigation = 'never';
        reactiveTableSettings.showColumnToggles = false;
        reactiveTableSettings.collection = depositItemsCollection;
        reactiveTableSettings.fields = [
            {key: 'itemId', label: 'ID'},
            {
                key: 'amount',
                label: 'Amount',
                fn (value, object, key) {
                    return value;
                }
            },
            {
                key: 'laboAmount',
                label: 'Labo Amount',
                fn (value, object, key) {
                    return value;
                    // return numeral(value).format('$0,0.00');
                }
            },
            {
                key: 'doctorAmount',
                label: 'Doctor Amount',
                fn (value, object, key) {
                    return value;
                    // return numeral(value).format('$0,0.00');
                }
            },
            {
                key: 'paidAmount',
                label: 'Paid',
                fn(value, object, key){
                    let val = _.isNull(value) ? 0 : value;
                    return Spacebars.SafeString(`<input type="text" value="${val}" class="paid">`);
                }
            },
            {
                key: 'balance',
                label: 'Balance',
                fn (value, object, key) {
                    return numeral(value).format('$0,0.00');
                }
            },
            // {
            //     key: '_id',
            //     label(){
            //         return fa('bars', '', true);
            //     },
            //     headerClass: function () {
            //         let css = 'text-center col-action-deposit-item';
            //         return css;
            //     },
            //     tmpl: actionTmpl, sortable: false
            // }
        ];

        return reactiveTableSettings;
    },
    // total: function () {
    //     let total = 0;
    //     let getItems = depositItemsCollection.find();
    //     getItems.forEach((obj)=> {
    //         total += obj.price;
    //     });
    //
    //     return total;
    // }
});
indexTmpl.onDestroyed(function () {
});
indexTmpl.events({
    'keyup .paidAmount'(event, instance){
        let $parents = $(event.currentTarget).parents('tr');
        let itemId = $parents.find('.itemId').text();
        let amount = $parents.find('.amount').text();
        let paidAmount = $parents.find('.paid').val();
        amount = _.isEmpty(amount) ? 0 : parseFloat(amount);
        paidAmount = _.isEmpty(paidAmount) ? 0 : parseFloat(paidAmount);
        let balance = amount - paidAmount;
        if (balance < 0) {
            balance = 0;
        }


        //set amount when keyup on paidAmount textbox
        let totalPaidAmount = 0;
        $('tr .paid').each(function () {
            let paid = _.isEmpty($(this).val()) ? 0 : parseFloat($(this).val());
            totalPaidAmount += paid;
        });

        $('[name="amount"]').val(totalPaidAmount);

        depositItemsCollection.update(
            {itemId: itemId}, {
                $set: {
                    paidAmount: paidAmount,
                    tempBalance: balance,
                    balance: balance,
                    status: balance > 0 ? "permission" : "ban"
                }
            }
        );

        totalBalance = 0;
        depositItemsCollection.find().forEach(function (obj) {
            totalBalance += obj.balance;
        });
        $('[name="totalBalance"]').val(totalBalance);
    }
});

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
import {lookupRegister} from '../../common/methods/lookup-register';

// Page
import './deposit-items.html';

// Declare template
let indexTmpl = Template.Dental_depositItems,
    actionTmpl = Template.Dental_depositItemsAction,
    newTmpl = Template.Dental_depositItemsNew,
    editTmpl = Template.Dental_depositItemsEdit;

// Local collection
var depositItemsCollection;

//Reactive Var
let diseaseItemVar = new ReactiveVar();
let diseaseItemDoc = new ReactiveVar();
let registerDoc = new ReactiveVar();

// Variable
let laboName, doctorName;

Tracker.autorun(()=> {
    if (diseaseItemVar.get()) {
        lookupDiseaseItems.callPromise({
            itemId: diseaseItemVar.get()
        }).then((result)=> {
            diseaseItemDoc.set(result);
        }).catch((err)=> {
            console.log(err);
        });
    }

    let registerId = FlowRouter.getQueryParam("registerId");

    lookupRegister.callPromise({
        registerId: registerId
    }).then((result)=> {
        registerDoc.set(result);
    }).catch((err)=> {
        console.log(err);
    });

});

// Index
indexTmpl.onCreated(function () {
    // Create new  alertify
    createNewAlertify('item', {size: 'lg'});

    // Data context
    let data;

    if (Template.currentData()) {
        data = Template.currentData();
    }
    doc= registerDoc.get().items;

    depositItemsCollection = data.depositItemsCollection;
    doc.forEach(function (obj) {
        if(obj!=undefined){
            depositItemsCollection.insert(obj);
        }
    })

});

indexTmpl.helpers({
    tableSettings: function () {
        let i18nPrefix = 'dental.deposit.schema';
        Session.set('depositItemsCollection',depositItemsCollection);

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
    total: function () {
        let total = 0;
        let getItems = depositItemsCollection.find();
        getItems.forEach((obj)=> {
            total += obj.amount;
        });

        return total;
    }
});

indexTmpl.events({
    'click .js-update-item': function (event, instance) {
        alertify.item(fa('pencil', 'Items'), renderTemplate(editTmpl, this));
    },
    'click .js-destroy-item': function (event, instance) {
        destroyAction(
            depositItemsCollection,
            {_id: this._id},
            {title: 'Items', itemTitle: this.itemId}
        );
    },
    'keyup .paidAmount'(event, instance){
        let $parents = $(event.currentTarget).parents('tr');
        let itemId = $parents.find('.itemId').text();
        let amount = $parents.find('.amount').text();
        let paidAmount = $parents.find('.paid').val();
        amount = _.isEmpty(amount) ? 0 : parseFloat(amount);
        paidAmount = _.isEmpty(paidAmount) ? 0 : parseFloat(paidAmount);
        let balance = numeral(amount - paidAmount).format("0,0.00");

        // $parents.find('.balance').text(balance);
        depositItemsCollection.update(
            {_id: itemId},
            {$set: {paidAmount: paidAmount, balance: balance}}
        );
        console.log(depositItemsCollection.find().fetch());
    },
    // 'blur .paidAmount': function (event, instance) {
    //
    //     let $parents = $(event.currentTarget).parents('tr');
    //
    //     let itemId = $parents.find('.itemId').text();
    //     let amount = $parents.find('.amount').text();
    //     let laboAmount = $parents.find('.laboAmount').text();
    //     let doctorAmount = $parents.find('.doctorAmount').text();
    //     let paidAmount = $parents.find('.paid').val();
    //     amount = _.isEmpty(amount) ? 0 : parseFloat(amount);
    //     paidAmount = _.isEmpty(paidAmount) ? 0 : parseFloat(paidAmount);
    //     let balance = math.round(amount - paidAmount, 2);
    //
    //     // Update
    //     depositItemsCollection.update(
    //         {_id: itemId},
    //         {$set: {paidAmount: paidAmount, balance: balance}}
    //     );
    //     console.log(depositItemsCollection.find().fetch());
    // }
});

// New
newTmpl.onCreated(function () {
    // State
    this.itemId = new ReactiveVar();
    this.date = new ReactiveVar();
    this.qty = new ReactiveVar(0);
    this.price = new ReactiveVar(0);
    this.discount = new ReactiveVar(0);
});

newTmpl.helpers({
    schema(){
        return DepositItemsSchema;
    },
    price: function () {
        return Template.instance().price.get();
    },
    amount: function () {
        const instance = Template.instance();
        let amount = instance.qty.get() * instance.price.get();
        let amountAfterDiscount = math.round(amount - (amount * instance.discount.get() / 100), 2);
        return amountAfterDiscount;
    },
    disabledAddItemBtn: function () {
        const instance = Template.instance();
        let patientSession = Session.get('patientVar');
        if (instance.itemId.get() && instance.date.get() && instance.qty.get() > 0) {
            return {};
        }

        return {disabled: true};
    }
});

newTmpl.events({
    'change [name="itemId"]': function (event, instance) {
        //get patient session from deposit.js
        let patientSession = Session.get('patientVar');
        let itemId = event.currentTarget.value;
        // set itemId value to diseaseItemVar
        diseaseItemVar.set(itemId);

        instance.itemId.set(itemId);

        // Check item value
        if (!_.isUndefined(patientSession) && itemId) {
            $.blockUI();
            lookupDiseaseItems.callPromise({
                itemId: itemId
            }).then((result)=> {
                instance.price.set(result.price);

                Meteor.setTimeout(()=> {
                    $.unblockUI();
                }, 100);

            }).catch((err)=> {
                console.log(err.message);
            });
        } else {
            instance.price.set(0);
            if (_.isUndefined(patientSession)) displayWarning('Please , Choose Patient !');
        }

        // Clear
        instance.$('[name="qty"]').val(1);
        instance.$('[name="date"]').val(moment().format('DD/MM/YYYY'));
        instance.qty.set(1);
        instance.date.set(moment().format('DD/MM/YYYY'));
    },
    'keyup [name="qty"],[name="price"],[name="discount"]': function (event, instance) {
        let qty = instance.$('[name="qty"]').val();
        let price = instance.$('[name="price"]').val();
        let discount = instance.$('[name="discount"]').val();
        qty = _.isEmpty(qty) ? 0 : parseInt(qty);
        price = _.isEmpty(price) ? 0 : parseFloat(price);
        discount = _.isEmpty(discount) ? 0 : parseInt(discount);

        instance.qty.set(qty);
        instance.price.set(price);
        instance.discount.set(discount);
    },
    'click .js-add-item': function (event, instance) {
        let patientDoc = Session.get('patientVarDoc');
        let diseaseDoc = diseaseItemDoc.get();
        let itemId = instance.$('[name="itemId"]').val();
        let itemName = _.split(instance.$('[name="itemId"] option:selected').text(), " : ")[1];
        let date = instance.$('[name="date"]').val();
        let qty = parseInt(instance.$('[name="qty"]').val());

        let labo = _.split(instance.$('[name="labo"] option:selected').text(), " : ")[1];
        laboName = labo;
        let doctor = _.split(instance.$('[name="doctor"] option:selected').text(), " : ")[1];
        doctorName = doctor;

        let price;
        price = math.round(parseFloat(instance.$('[name="price"]').val()), 2);
        if (patientDoc.member == "Yes") {
            price = math.round(parseFloat(diseaseDoc.memberPrice), 2);
        }

        let discount = instance.$('[name="discount"]').val();
        discount = discount ? math.round(parseFloat(discount), 2) : 0;

        let amount = qty * price;
        let amountAfterDiscount = math.round(amount - (amount * instance.discount.get() / 100), 2);
        let mydate = moment(date, "DD-MM-YYYY");
        let datefm = moment(mydate, "YYYY-MM-DD HH:mm Z").toDate();

        let laboId = instance.$('[name="labo"]').val();
        // let laboName = laboId ? _.split(instance.$('[name="labo"] option:selected').text(), " : ")[1] : 'None';

        let laboAmount = instance.$('[name="laboAmount"]').val();
        laboAmount = laboAmount ? math.round(parseFloat(instance.$('[name="laboAmount"]').val()), 2) : 0;

        let doctorId = instance.$('[name="doctor"]').val();
        // let doctorName = doctorId ? _.split(instance.$('[name="doctor"] option:selected').text(), " : ")[1] : 'None';

        let doctorAmount = instance.$('[name="doctorAmount"]').val();
        doctorAmount = doctorAmount ? math.round(parseFloat(instance.$('[name="doctorAmount"]').val()), 2) : 0;

        // Check exist
        let exist = depositItemsCollection.findOne({itemId: itemId});
        if (exist) {
            qty += parseInt(exist.qty);
            amount = math.round(qty * price, 2);

            depositItemsCollection.update(
                {_id: itemId},
                {
                    $set: {
                        date: datefm,
                        qty: qty,
                        price: price,
                        discount: discount,
                        amount: amountAfterDiscount,
                        labo: laboId,
                        laboAmount: laboAmount,
                        doctor: doctorId,
                        doctorAmount: doctorAmount
                    }
                }
            );
        } else {
            depositItemsCollection.insert({
                _id: itemId,
                itemId: itemId,
                itemName: itemName,
                date: datefm,
                qty: qty,
                price: price,
                discount: discount,
                amount: amountAfterDiscount,
                labo: laboId,
                laboAmount: laboAmount,
                doctor: doctorId,
                doctorAmount: doctorAmount
            });
        }
    },
});

// Edit
editTmpl.onCreated(function () {
    this.qty = new ReactiveVar(0);
    this.price = new ReactiveVar(0);
    this.discount = new ReactiveVar(0);
    this.amount = new ReactiveVar(0);

    this.autorun(()=> {
        let data = Template.currentData();

        this.qty.set(data.qty);
        this.price.set(data.price);
        this.discount.set(data.discount);
    });
});

editTmpl.helpers({
    schema(){
        return DepositItemsSchema;
    },
    data: function () {
        let data = Template.currentData();
        return data;
    },
    price: function () {
        return Template.instance().price.get();
    },
    amount: function () {
        const instance = Template.instance();
        let amount = instance.qty.get() * instance.price.get();
        let amountAfterDiscount = math.round(amount - (amount * instance.discount.get() / 100), 2);
        console.log('discount : ' + instance.discount.get() + ' amount :' + amountAfterDiscount);
        return amountAfterDiscount;
    }
});

editTmpl.events({
    'change [name="itemId"]': function (event, instance) {
        //get patient session from deposit.js
        let patientSession = Session.get('patientVar');

        let itemId = event.currentTarget.value;

        // Check item value
        if (!_.isUndefined(patientSession) && itemId) {
            $.blockUI();
            lookupDiseaseItems.callPromise({
                itemId: itemId
            }).then((result)=> {

                instance.price.set(result.price);

                Meteor.setTimeout(()=> {
                    $.unblockUI();
                }, 100);

            }).catch((err)=> {
                console.log(err.message);
            });
        } else {
            instance.price.set(0);
            displayWarning('Please , Choose Patient !');
        }
    },
    'keyup [name="qty"],[name="price"],[name="discount"]': function (event, instance) {
        let qty = instance.$('[name="qty"]').val();
        let price = instance.$('[name="price"]').val();
        let discount = instance.$('[name="discount"]').val();
        qty = _.isEmpty(qty) ? 0 : parseInt(qty);
        price = _.isEmpty(price) ? 0 : parseFloat(price);
        discount = _.isEmpty(discount) ? 0 : parseFloat(discount);

        instance.qty.set(qty);
        instance.price.set(price);
        instance.discount.set(discount);
    },
    'click .btn-submit': function (event, instance) {
        let labo = _.split(instance.$('[name="labo"] option:selected').text(), " : ")[1];
        laboName = labo;
        let doctor = _.split(instance.$('[name="doctor"] option:selected').text(), " : ")[1];
        doctorName = doctor;
    }
});

let hooksObject = {
    onSubmit: function (insertDoc, updateDoc, currentDoc) {
        this.event.preventDefault();

        // Check old item
        if (insertDoc.itemId == currentDoc.itemId) {
            depositItemsCollection.update(
                {_id: currentDoc.itemId},
                updateDoc
            );
        } else {
            depositItemsCollection.remove({_id: currentDoc.itemId});

            // Check exist item
            let exist = depositItemsCollection.findOne({_id: insertDoc.itemId});

            if (exist) {

                let newQty = exist.qty + insertDoc.qty;
                let newPrice = insertDoc.price;
                let newAmount = math.round(newQty * newPrice, 2);

                depositItemsCollection.update(
                    {_id: insertDoc.itemId},
                    {
                        $set: {
                            qty: newQty,
                            price: newPrice,
                            amount: newAmount
                        }
                    }
                );
            } else {
                let itemName = _.split($('[name="itemId"] option:selected').text(), " : ")[1];
                depositItemsCollection.insert({
                    _id: insertDoc.itemId,
                    itemId: insertDoc.itemId,
                    itemName: itemName,
                    date: insertDoc.date,
                    qty: insertDoc.qty,
                    price: insertDoc.price,
                    amount: insertDoc.amount,
                });
            }
        }

        this.done();
    },
    onSuccess: function (formType, result) {
        alertify.item().close();
        displaySuccess();
    },
    onError: function (formType, error) {
        displayError(error.message);
    }
};
AutoForm.addHooks(['Dental_depositItemsEdit'], hooksObject);

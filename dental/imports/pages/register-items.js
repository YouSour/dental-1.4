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
import {lookupLaboItems} from '../../common/methods/lookup-labo-items.js';

// Collection
import {RegisterItemsSchema} from '../../common/collections/register-items.js';

// Page
import './register-items.html';

// Declare template
let indexTmpl = Template.Dental_registerItems,
    actionTmpl = Template.Dental_registerItemsAction,
    newTmpl = Template.Dental_registerItemsNew,
    editTmpl = Template.Dental_registerItemsEdit;

// Local collection
let registerItemsCollection;

//Reactive Var
let diseaseItemVar = new ReactiveVar();
let diseaseItemDoc = new ReactiveVar();

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
});

// Index
indexTmpl.onCreated(function () {
    // Create new  alertify
    createNewAlertify('item', {size: 'lg'});

    // Data context
    let data = Template.currentData();
    registerItemsCollection = data.registerItemsCollection;
});

indexTmpl.helpers({
    tableSettings: function () {
        let i18nPrefix = 'dental.register.schema';

        reactiveTableSettings.showFilter = false;
        reactiveTableSettings.showNavigation = 'never';
        reactiveTableSettings.showColumnToggles = false;
        reactiveTableSettings.collection = registerItemsCollection;
        reactiveTableSettings.fields = [
            {key: 'itemId', label: 'ID'},
            {key: 'itemName', label: 'Name'},
            {
                key: 'date', label: 'Date',
                fn (value, object, key) {
                    return moment(value).format('DD/MM/YYYY');
                }
            },
            {key: 'qty', label: 'Qty'},
            {
                key: 'price',
                label: 'Price',
                fn (value, object, key) {
                    return numeral(value).format('$0,0.00');
                }
            },
            {
                key: 'discount',
                label: 'Discount (%)',
                fn(value, obj, key){
                    return value + " %";
                }
            },
            {
                key: 'amount',
                label: 'Amount',
                fn (value, object, key) {
                    return numeral(value).format('$0,0.00');
                }
            },
            {
                key: 'laboName',
                label: 'Labo',
                fn(value, object, key){
                    return value;
                    // if (value) {
                    //     return laboName;
                    // }
                    // return "None";
                }
            },
            {
                key: 'laboAmount',
                label: 'Labo Amount',
                fn (value, object, key) {
                    return numeral(value).format('$0,0.00');
                }
            },
            {
                key: 'doctorName',
                label: 'Doctor',
                fn(value, object, key){
                    return value;

                    // if (value) {
                    //     return doctorName;
                    // }
                    // return "None";
                }
            },
            {
                key: 'doctorAmount',
                label: 'Doctor Amount',
                fn (value, object, key) {
                    return numeral(value).format('$0,0.00');
                }
            },
            {
                key: '_id',
                label(){
                    return fa('bars', '', true);
                },
                headerClass: function () {
                    let css = 'text-center col-action-register-item';
                    return css;
                },
                tmpl: actionTmpl, sortable: false
            }
        ];

        return reactiveTableSettings;
    },
    subTotal: function () {
        let subTotal = 0;
        let getItems = registerItemsCollection.find();
        getItems.forEach((obj)=> {
            subTotal += obj.amount;
        });
        return subTotal;
    },
    total: function () {
        if (!Session.get('update')) {
            let total = 0;
            let getItems = registerItemsCollection.find();
            getItems.forEach((obj)=> {
                total += obj.amount;
            });
            return total;
        }
    }
});

indexTmpl.events({
    'click .js-update-item': function (event, instance) {
        alertify.item(fa('pencil', 'Items'), renderTemplate(editTmpl, this));
    },
    'click .js-destroy-item': function (event, instance) {
        destroyAction(
            registerItemsCollection,
            {_id: this._id},
            {title: 'Items', itemTitle: this.itemId}
        );
    },
    'keyup .item-qty,.item-price'(event, instance){
        let $parents = $(event.currentTarget).parents('tr');

        let itemId = $parents.find('.itemId').text();
        let qty = $parents.find('.item-qty').val();
        let price = $parents.find('.item-price').val();
        let discount = $parents.find('.discount').val();
        qty = _.isEmpty(qty) ? 0 : parseInt(qty);
        price = _.isEmpty(price) ? 0 : parseFloat(price);
        discount = _.isEmpty(discount) ? 0 : parseFloat(discount);
        let amount = numeral(qty * price).format("0,0.00");

        $parents.find('.amount').text(amount);
    },
    'blur .item-qty,.item-price': function (event, instance) {
        let $parents = $(event.currentTarget).parents('tr');

        let itemId = $parents.find('.itemId').text();
        let qty = $parents.find('.item-qty').val();
        let price = $parents.find('.item-price').val();
        qty = _.isEmpty(qty) ? 0 : parseInt(qty);
        price = _.isEmpty(price) ? 0 : parseFloat(price);
        amount = math.round(qty * price, 2);

        // Update
        $parents.find('.amount').text('');
        registerItemsCollection.update(
            {_id: itemId},
            {$set: {qty: qty, price: price, amount: amount}}
        );
    },
    'keyup [name="subDiscount"]'(event, instance){
        let subTotal = $('[name="subTotal"]').val();
        let subDiscount = $('[name="subDiscount"]').val();
        $('[name="total"]').val(subTotal - subDiscount);

        registerItemsCollection.update(
            {_id: itemId},
            {$set: {qty: qty, price: price, amount: amount}}
        );
    }
});

// New
newTmpl.onCreated(function () {
    // State
    this.itemId = new ReactiveVar();
    this.date = new ReactiveVar();
    this.qty = new ReactiveVar(0);
    this.price = new ReactiveVar(0);
    this.discount = new ReactiveVar(0);
    this.amount = new ReactiveVar(0);
    this.laboAmount = new ReactiveVar(0);
});

newTmpl.helpers({
    schema(){
        return RegisterItemsSchema;
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
    laboAmount: function () {
        return Template.instance().laboAmount.get();
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
        //get patient session from register.js
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
    'change [name="labo"]': function (event, instance) {
        let labo = event.currentTarget.value;
        if (labo) {
            $.blockUI();
            lookupLaboItems.callPromise({
                labo: labo
            }).then((result)=> {
                instance.laboAmount.set(result.price);

                Meteor.setTimeout(()=> {
                    $.unblockUI();
                }, 100);

            }).catch((err)=> {
                console.log(err.message);
            });
        } else {
            instance.laboAmount.set(0);
        }
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

        let price = math.round(parseFloat(instance.$('[name="price"]').val()), 2);
        if (patientDoc.member == "Yes") {
            price = math.round(parseFloat(diseaseDoc.memberPrice), 2);
        }

        let discount = instance.$('[name="discount"]').val();
        discount = discount ? math.round(parseFloat(discount), 2) : 0;

        let amount = qty * price;
        let amountAfterDiscount = math.round(amount - (amount * instance.discount.get() / 100), 2);

        // console.log(amountAfterDiscount);
        let mydate = moment(date, "DD-MM-YYYY");
        let datefm = moment(mydate, "YYYY-MM-DD HH:mm Z").toDate();

        let laboId = instance.$('[name="labo"]').val();
        let laboName = laboId ? _.split(instance.$('[name="labo"] option:selected').text(), " : ")[1] : 'None';

        let laboAmount = instance.$('[name="laboAmount"]').val();
        laboAmount = laboAmount ? math.round(parseFloat(instance.$('[name="laboAmount"]').val()), 2) : 0;

        let doctorId = instance.$('[name="doctor"]').val();
        let doctorName = doctorId ? _.split(instance.$('[name="doctor"] option:selected').text(), " : ")[1] : 'None';

        let doctorAmount = instance.$('[name="doctorAmount"]').val();
        doctorAmount = doctorAmount ? math.round(parseFloat(instance.$('[name="doctorAmount"]').val()), 2) : 0;

        // Check exist
        let exist = registerItemsCollection.findOne({itemId: itemId});
        if (exist) {
            qty += parseInt(exist.qty);
            amount = qty * price;
            amountAfterDiscount = math.round(amount - (amount * instance.discount.get() / 100), 2);

            registerItemsCollection.update(
                {_id: itemId},
                {
                    $set: {
                        date: datefm,
                        qty: qty,
                        price: price,
                        discount: discount,
                        amount: amountAfterDiscount,
                        labo: laboId,
                        laboName: laboName,
                        laboAmount: laboAmount,
                        doctor: doctorId,
                        doctorName: doctorName,
                        doctorAmount: doctorAmount
                    }
                }
            );
        } else {
            registerItemsCollection.insert({
                _id: itemId,
                itemId: itemId,
                itemName: itemName,
                date: datefm,
                qty: qty,
                price: price,
                discount: discount,
                amount: amountAfterDiscount,
                labo: laboId,
                laboName: laboName,
                laboAmount: laboAmount,
                doctor: doctorId,
                doctorName: doctorName,
                doctorAmount: doctorAmount
            });
        }
    }
});

// Edit
editTmpl.onCreated(function () {
    this.qty = new ReactiveVar(0);
    this.price = new ReactiveVar(0);
    this.discount = new ReactiveVar(0);
    this.amount = new ReactiveVar(0);
    this.laboAmount = new ReactiveVar(0);

    this.autorun(()=> {
        let data = Template.currentData();

        this.qty.set(data.qty);
        this.price.set(data.price);
        this.discount.set(data.discount);
        this.laboAmount.set(data.laboAmount);
    });
});

editTmpl.helpers({
    schema(){
        return RegisterItemsSchema;
    },
    data: function () {
        let data = Template.currentData();
        return data;
    },
    price: function () {
        return Template.instance().price.get();
    },
    laboAmount: function () {
        return Template.instance().laboAmount.get();
    },
    amount: function () {
        const instance = Template.instance();
        let amount = instance.qty.get() * instance.price.get();
        let amountAfterDiscount = math.round(amount - (amount * instance.discount.get() / 100), 2);
        return amountAfterDiscount;
    }
});

editTmpl.events({
    'change [name="itemId"]': function (event, instance) {
        //get patient session from register.js
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
    'change [name="labo"]': function (event, instance) {
        let labo = event.currentTarget.value;
        if (labo) {
            $.blockUI();
            lookupLaboItems.callPromise({
                labo: labo
            }).then((result)=> {
                instance.laboAmount.set(result.price);

                Meteor.setTimeout(()=> {
                    $.unblockUI();
                }, 100);

            }).catch((err)=> {
                console.log(err.message);
            });
        } else {
            instance.laboAmount.set(0);
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
    }
});

let hooksObject = {
    onSubmit: function (insertDoc, updateDoc, currentDoc) {
        this.event.preventDefault();
        let laboName = _.split($('[name="labo"] option:selected').text(), " : ")[2];
        let doctorName = _.split($('[name="doctor"] option:selected').text(), " : ")[2];

        // Check old item
        if (insertDoc.itemId == currentDoc.itemId) {
            registerItemsCollection.update(
                {_id: currentDoc.itemId},
                {
                    $set: {
                        date: insertDoc.date,
                        qty: insertDoc.qty,
                        price: insertDoc.price,
                        discount: insertDoc.discount,
                        amount: insertDoc.amount,
                        labo: insertDoc.labo,
                        laboName: laboName,
                        laboAmount: insertDoc.laboAmount,
                        doctor: insertDoc.doctor,
                        doctorName: doctorName,
                        doctorAmount: insertDoc.doctorAmount
                    }
                }
            );

        } else {
            registerItemsCollection.remove({_id: currentDoc.itemId});

            // Check exist item
            let exist = registerItemsCollection.findOne({_id: insertDoc.itemId});

            if (exist) {
                let newQty = exist.qty + insertDoc.qty;
                let newPrice = insertDoc.price;
                let newAmount = math.round(newQty * newPrice, 2);

                registerItemsCollection.update(
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
                let itemName = _.split($('[name="itemId"] option:selected').text(), " : ")[2];
                registerItemsCollection.insert({
                    _id: insertDoc.itemId,
                    itemId: insertDoc.itemId,
                    itemName: itemName,
                    date: insertDoc.date,
                    qty: insertDoc.qty,
                    price: insertDoc.price,
                    amount: insertDoc.amount,
                    discount: insertDoc.discount,
                    labo: insertDoc.labo,
                    laboName: laboName,
                    laboAmount: insertDoc.laboAmount,
                    doctor: insertDoc.doctor,
                    doctorName: doctorName,
                    doctorAmount: insertDoc.doctorAmount
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
AutoForm.addHooks(['Dental_registerItemsEdit'], hooksObject);

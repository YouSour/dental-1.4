import {Meteor} from 'meteor/meteor';
import {SimpleSchema} from 'meteor/aldeed:simple-schema';

// Collection
import {Deposit} from '../../common/collections/deposit.js';

Meteor.publish('dental.deposit', function dentalDeposit() {
    this.unblock();

    if (!this.userId) {
        return this.ready();
    }

    return Deposit.find();
});

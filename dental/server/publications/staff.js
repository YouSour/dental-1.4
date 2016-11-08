import {Meteor} from 'meteor/meteor';
import {SimpleSchema} from 'meteor/aldeed:simple-schema';
import {ReactiveTable} from 'meteor/aslagle:reactive-table';

// Collection
import {Staff} from '../../common/collections/staff.js';

Meteor.publish('dental.staff', function simpleStaff() {
    this.unblock();

    if (!this.userId) {
        return this.ready();
    }

    return Staff.find();
});
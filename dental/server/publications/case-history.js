import {Meteor} from 'meteor/meteor';
import {SimpleSchema} from 'meteor/aldeed:simple-schema';
import {ReactiveTable} from 'meteor/aslagle:reactive-table';

// Collection
import {CaseHistory} from '../../common/collections/case-history.js';

Meteor.publish('dental.caseHistory', function simpleCaseHistory() {
    this.unblock();

    if (!this.userId) {
        return this.ready();
    }

    return CaseHistory.find();
});
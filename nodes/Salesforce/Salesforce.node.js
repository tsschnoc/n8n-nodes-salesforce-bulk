"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Salesforce = void 0;
const n8n_workflow_1 = require("n8n-workflow");
const CustomObjectDescription_1 = require("./CustomObjectDescription");
const FlowDescription_1 = require("./FlowDescription");
const GenericFunctions_1 = require("./GenericFunctions");
const SearchDescription_1 = require("./SearchDescription");

class Salesforce {
    constructor() {
        this.description = {
            displayName: 'Salesforce',
            name: 'salesforce',
            icon: 'file:salesforce.svg',
            group: ['output'],
            version: 1,
            subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
            description: 'Consume Salesforce API',
            defaults: {
                name: 'Salesforce',
            },
            inputs: ['main'],
            outputs: ['main'],
            credentials: [
                {
                    name: 'salesforceOAuth2Api',
                    required: true,
                    displayOptions: {
                        show: {
                            authentication: ['oAuth2'],
                        },
                    },
                },
                {
                    name: 'salesforceJwtApi',
                    required: true,
                    displayOptions: {
                        show: {
                            authentication: ['jwt'],
                        },
                    },
                },
            ],
            properties: [
                {
                    displayName: 'Authentication',
                    name: 'authentication',
                    type: 'options',
                    options: [
                        {
                            name: 'OAuth2',
                            value: 'oAuth2',
                        },
                        {
                            name: 'OAuth2 JWT',
                            value: 'jwt',
                        },
                    ],
                    default: 'oAuth2',
                    description: 'OAuth Authorization Flow',
                },
                {
                    displayName: 'Resource',
                    name: 'resource',
                    type: 'options',
                    noDataExpression: true,
                    options: [
                        {
                            name: 'Account',
                            value: 'account',
                            description: 'Represents an individual account, which is an organization or person involved with your business (such as customers, competitors, and partners)',
                        },
                        {
                            name: 'Attachment',
                            value: 'attachment',
                            description: 'Represents a file that a has uploaded and attached to a parent object',
                        },
                        {
                            name: 'Case',
                            value: 'case',
                            description: 'Represents a case, which is a customer issue or problem',
                        },
                        {
                            name: 'Contact',
                            value: 'contact',
                            description: 'Represents a contact, which is an individual associated with an account',
                        },
                        {
                            name: 'Custom Object',
                            value: 'customObject',
                            description: 'Represents a custom object',
                        },
                        {
                            name: 'Document',
                            value: 'document',
                            description: 'Represents a document',
                        },
                        {
                            name: 'Flow',
                            value: 'flow',
                            description: 'Represents an autolaunched flow',
                        },
                        {
                            name: 'Lead',
                            value: 'lead',
                            description: 'Represents a prospect or potential',
                        },
                        {
                            name: 'Opportunity',
                            value: 'opportunity',
                            description: 'Represents an opportunity, which is a sale or pending deal',
                        },
                        {
                            name: 'Search',
                            value: 'search',
                            description: 'Search records',
                        },
                        {
                            name: 'Task',
                            value: 'task',
                            description: 'Represents a business activity such as making a phone call or other to-do items. In the user interface, and records are collectively referred to as activities.',
                        },
                        {
                            name: 'User',
                            value: 'user',
                            description: 'Represents a person, which is one user in system',
                        },
                    ],
                    default: 'lead',
                },
                ...CustomObjectDescription_1.customObjectOperations,
                ...CustomObjectDescription_1.customObjectFields,
                ...SearchDescription_1.searchOperations,
                ...SearchDescription_1.searchFields,
                ...FlowDescription_1.flowOperations,
                ...FlowDescription_1.flowFields,
            ],
        };
        this.methods = {
            loadOptions: {
                async getLeadStatuses() {
                    const returnData = [];
                    const qs = {
                        q: 'SELECT id, MasterLabel FROM LeadStatus',
                    };
                    const statuses = await GenericFunctions_1.salesforceApiRequestAllItems.call(this, 'records', 'GET', '/query', {}, qs);
                    for (const status of statuses) {
                        const statusName = status.MasterLabel;
                        returnData.push({
                            name: statusName,
                            value: statusName,
                        });
                    }
                    (0, GenericFunctions_1.sortOptions)(returnData);
                    return returnData;
                },
                async getUsers() {
                    const returnData = [];
                    const qs = {
                        q: 'SELECT id, Name FROM User',
                    };
                    const users = await GenericFunctions_1.salesforceApiRequestAllItems.call(this, 'records', 'GET', '/query', {}, qs);
                    for (const user of users) {
                        const userName = user.Name;
                        const userId = user.Id;
                        returnData.push({
                            name: userName,
                            value: userId,
                        });
                    }
                    (0, GenericFunctions_1.sortOptions)(returnData);
                    return returnData;
                },
                async getCaseOwners() {
                    const returnData = [];
                    const qsQueues = {
                        q: "SELECT Queue.Id, Queue.Name FROM QueuesObject where Queue.Type='Queue' and SobjectType = 'Case'",
                    };
                    const queues = await GenericFunctions_1.salesforceApiRequestAllItems.call(this, 'records', 'GET', '/query', {}, qsQueues);
                    for (const queue of queues) {
                        const queueName = queue.Queue.Name;
                        const queueId = queue.Queue.Id;
                        returnData.push({
                            name: `Queue: ${queueName}`,
                            value: queueId,
                        });
                    }
                    const qsUsers = {
                        q: 'SELECT id, Name FROM User',
                    };
                    const users = await GenericFunctions_1.salesforceApiRequestAllItems.call(this, 'records', 'GET', '/query', {}, qsUsers);
                    const userPrefix = returnData.length > 0 ? 'User: ' : '';
                    for (const user of users) {
                        const userName = user.Name;
                        const userId = user.Id;
                        returnData.push({
                            name: userPrefix + userName,
                            value: userId,
                        });
                    }
                    (0, GenericFunctions_1.sortOptions)(returnData);
                    return returnData;
                },
                async getLeadOwners() {
                    const returnData = [];
                    const qsQueues = {
                        q: "SELECT Queue.Id, Queue.Name FROM QueuesObject where Queue.Type='Queue' and SobjectType = 'Lead'",
                    };
                    const queues = await GenericFunctions_1.salesforceApiRequestAllItems.call(this, 'records', 'GET', '/query', {}, qsQueues);
                    for (const queue of queues) {
                        const queueName = queue.Queue.Name;
                        const queueId = queue.Queue.Id;
                        returnData.push({
                            name: `Queue: ${queueName}`,
                            value: queueId,
                        });
                    }
                    const qsUsers = {
                        q: 'SELECT id, Name FROM User',
                    };
                    const users = await GenericFunctions_1.salesforceApiRequestAllItems.call(this, 'records', 'GET', '/query', {}, qsUsers);
                    const userPrefix = returnData.length > 0 ? 'User: ' : '';
                    for (const user of users) {
                        const userName = user.Name;
                        const userId = user.Id;
                        returnData.push({
                            name: userPrefix + userName,
                            value: userId,
                        });
                    }
                    (0, GenericFunctions_1.sortOptions)(returnData);
                    return returnData;
                },
                async getLeadSources() {
                    const returnData = [];
                    const { fields } = await GenericFunctions_1.salesforceApiRequest.call(this, 'GET', '/sobjects/lead/describe');
                    for (const field of fields) {
                        if (field.name === 'LeadSource') {
                            for (const pickValue of field.picklistValues) {
                                const pickValueName = pickValue.label;
                                const pickValueId = pickValue.value;
                                returnData.push({
                                    name: pickValueName,
                                    value: pickValueId,
                                });
                            }
                        }
                    }
                    (0, GenericFunctions_1.sortOptions)(returnData);
                    return returnData;
                },
                async getCustomFields() {
                    const returnData = [];
                    const resource = this.getNodeParameter('resource', 0);
                    const { fields } = await GenericFunctions_1.salesforceApiRequest.call(this, 'GET', `/sobjects/${resource}/describe`);
                    for (const field of fields) {
                        if (field.custom === true) {
                            const fieldName = field.label;
                            const fieldId = field.name;
                            returnData.push({
                                name: fieldName,
                                value: fieldId,
                            });
                        }
                    }
                    (0, GenericFunctions_1.sortOptions)(returnData);
                    return returnData;
                },
                async getRecordTypes() {
                    const returnData = [];
                    let resource = this.getNodeParameter('resource', 0);
                    if (resource === 'customObject') {
                        resource = this.getNodeParameter('customObject', 0);
                    }
                    const qs = {
                        q: `SELECT Id, Name, SobjectType, IsActive FROM RecordType WHERE SobjectType = '${resource}'`,
                    };
                    const types = await GenericFunctions_1.salesforceApiRequestAllItems.call(this, 'records', 'GET', '/query', {}, qs);
                    for (const type of types) {
                        if (type.IsActive === true) {
                            returnData.push({
                                name: type.Name,
                                value: type.Id,
                            });
                        }
                    }
                    (0, GenericFunctions_1.sortOptions)(returnData);
                    return returnData;
                },
                async getExternalIdFields() {
                    const returnData = [];
                    let resource = this.getCurrentNodeParameter('resource');
                    resource =
                        resource === 'customObject'
                            ? this.getCurrentNodeParameter('customObject')
                            : resource;
                    const { fields } = await GenericFunctions_1.salesforceApiRequest.call(this, 'GET', `/sobjects/${resource}/describe`);
                    for (const field of fields) {
                        if (field.externalId === true || field.idLookup === true) {
                            const fieldName = field.label;
                            const fieldId = field.name;
                            returnData.push({
                                name: fieldName,
                                value: fieldId,
                            });
                        }
                    }
                    (0, GenericFunctions_1.sortOptions)(returnData);
                    return returnData;
                },
                async getAccounts() {
                    const returnData = [];
                    const qs = {
                        q: 'SELECT id, Name FROM Account',
                    };
                    const accounts = await GenericFunctions_1.salesforceApiRequestAllItems.call(this, 'records', 'GET', '/query', {}, qs);
                    for (const account of accounts) {
                        const accountName = account.Name;
                        const accountId = account.Id;
                        returnData.push({
                            name: accountName,
                            value: accountId,
                        });
                    }
                    (0, GenericFunctions_1.sortOptions)(returnData);
                    return returnData;
                },
                async getCampaigns() {
                    const returnData = [];
                    const qs = {
                        q: 'SELECT id, Name FROM Campaign',
                    };
                    const campaigns = await GenericFunctions_1.salesforceApiRequestAllItems.call(this, 'records', 'GET', '/query', {}, qs);
                    for (const campaign of campaigns) {
                        const campaignName = campaign.Name;
                        const campaignId = campaign.Id;
                        returnData.push({
                            name: campaignName,
                            value: campaignId,
                        });
                    }
                    (0, GenericFunctions_1.sortOptions)(returnData);
                    return returnData;
                },
                async getStages() {
                    const returnData = [];
                    const { fields } = await GenericFunctions_1.salesforceApiRequest.call(this, 'GET', '/sobjects/opportunity/describe');
                    for (const field of fields) {
                        if (field.name === 'StageName') {
                            for (const pickValue of field.picklistValues) {
                                const pickValueName = pickValue.label;
                                const pickValueId = pickValue.value;
                                returnData.push({
                                    name: pickValueName,
                                    value: pickValueId,
                                });
                            }
                        }
                    }
                    (0, GenericFunctions_1.sortOptions)(returnData);
                    return returnData;
                },
                async getAccountTypes() {
                    const returnData = [];
                    const { fields } = await GenericFunctions_1.salesforceApiRequest.call(this, 'GET', '/sobjects/account/describe');
                    for (const field of fields) {
                        if (field.name === 'Type') {
                            for (const pickValue of field.picklistValues) {
                                const pickValueName = pickValue.label;
                                const pickValueId = pickValue.value;
                                returnData.push({
                                    name: pickValueName,
                                    value: pickValueId,
                                });
                            }
                        }
                    }
                    (0, GenericFunctions_1.sortOptions)(returnData);
                    return returnData;
                },
                async getAccountSources() {
                    const returnData = [];
                    const { fields } = await GenericFunctions_1.salesforceApiRequest.call(this, 'GET', '/sobjects/account/describe');
                    for (const field of fields) {
                        if (field.name === 'AccountSource') {
                            for (const pickValue of field.picklistValues) {
                                const pickValueName = pickValue.label;
                                const pickValueId = pickValue.value;
                                returnData.push({
                                    name: pickValueName,
                                    value: pickValueId,
                                });
                            }
                        }
                    }
                    (0, GenericFunctions_1.sortOptions)(returnData);
                    return returnData;
                },
                async getCaseTypes() {
                    const returnData = [];
                    const { fields } = await GenericFunctions_1.salesforceApiRequest.call(this, 'GET', '/sobjects/case/describe');
                    for (const field of fields) {
                        if (field.name === 'Type') {
                            for (const pickValue of field.picklistValues) {
                                const pickValueName = pickValue.label;
                                const pickValueId = pickValue.value;
                                returnData.push({
                                    name: pickValueName,
                                    value: pickValueId,
                                });
                            }
                        }
                    }
                    (0, GenericFunctions_1.sortOptions)(returnData);
                    return returnData;
                },
                async getCaseStatuses() {
                    const returnData = [];
                    const { fields } = await GenericFunctions_1.salesforceApiRequest.call(this, 'GET', '/sobjects/case/describe');
                    for (const field of fields) {
                        if (field.name === 'Status') {
                            for (const pickValue of field.picklistValues) {
                                const pickValueName = pickValue.label;
                                const pickValueId = pickValue.value;
                                returnData.push({
                                    name: pickValueName,
                                    value: pickValueId,
                                });
                            }
                        }
                    }
                    (0, GenericFunctions_1.sortOptions)(returnData);
                    return returnData;
                },
                async getCaseReasons() {
                    const returnData = [];
                    const { fields } = await GenericFunctions_1.salesforceApiRequest.call(this, 'GET', '/sobjects/case/describe');
                    for (const field of fields) {
                        if (field.name === 'Reason') {
                            for (const pickValue of field.picklistValues) {
                                const pickValueName = pickValue.label;
                                const pickValueId = pickValue.value;
                                returnData.push({
                                    name: pickValueName,
                                    value: pickValueId,
                                });
                            }
                        }
                    }
                    (0, GenericFunctions_1.sortOptions)(returnData);
                    return returnData;
                },
                async getCaseOrigins() {
                    const returnData = [];
                    const { fields } = await GenericFunctions_1.salesforceApiRequest.call(this, 'GET', '/sobjects/case/describe');
                    for (const field of fields) {
                        if (field.name === 'Origin') {
                            for (const pickValue of field.picklistValues) {
                                const pickValueName = pickValue.label;
                                const pickValueId = pickValue.value;
                                returnData.push({
                                    name: pickValueName,
                                    value: pickValueId,
                                });
                            }
                        }
                    }
                    (0, GenericFunctions_1.sortOptions)(returnData);
                    return returnData;
                },
                async getCasePriorities() {
                    const returnData = [];
                    const { fields } = await GenericFunctions_1.salesforceApiRequest.call(this, 'GET', '/sobjects/case/describe');
                    for (const field of fields) {
                        if (field.name === 'Priority') {
                            for (const pickValue of field.picklistValues) {
                                const pickValueName = pickValue.label;
                                const pickValueId = pickValue.value;
                                returnData.push({
                                    name: pickValueName,
                                    value: pickValueId,
                                });
                            }
                        }
                    }
                    (0, GenericFunctions_1.sortOptions)(returnData);
                    return returnData;
                },
                async getTaskStatuses() {
                    const returnData = [];
                    const { fields } = await GenericFunctions_1.salesforceApiRequest.call(this, 'GET', '/sobjects/task/describe');
                    for (const field of fields) {
                        if (field.name === 'Status') {
                            for (const pickValue of field.picklistValues) {
                                const pickValueName = pickValue.label;
                                const pickValueId = pickValue.value;
                                returnData.push({
                                    name: pickValueName,
                                    value: pickValueId,
                                });
                            }
                        }
                    }
                    (0, GenericFunctions_1.sortOptions)(returnData);
                    return returnData;
                },
                async getTaskTypes() {
                    const returnData = [];
                    const { fields } = await GenericFunctions_1.salesforceApiRequest.call(this, 'GET', '/sobjects/task/describe');
                    for (const field of fields) {
                        if (field.name === 'TaskSubtype') {
                            for (const pickValue of field.picklistValues) {
                                const pickValueName = pickValue.label;
                                const pickValueId = pickValue.value;
                                returnData.push({
                                    name: pickValueName,
                                    value: pickValueId,
                                });
                            }
                        }
                    }
                    (0, GenericFunctions_1.sortOptions)(returnData);
                    return returnData;
                },
                async getTaskSubjects() {
                    const returnData = [];
                    const { fields } = await GenericFunctions_1.salesforceApiRequest.call(this, 'GET', '/sobjects/task/describe');
                    for (const field of fields) {
                        if (field.name === 'Subject') {
                            for (const pickValue of field.picklistValues) {
                                const pickValueName = pickValue.label;
                                const pickValueId = pickValue.value;
                                returnData.push({
                                    name: pickValueName,
                                    value: pickValueId,
                                });
                            }
                        }
                    }
                    (0, GenericFunctions_1.sortOptions)(returnData);
                    return returnData;
                },
                async getTaskCallTypes() {
                    const returnData = [];
                    const { fields } = await GenericFunctions_1.salesforceApiRequest.call(this, 'GET', '/sobjects/task/describe');
                    for (const field of fields) {
                        if (field.name === 'CallType') {
                            for (const pickValue of field.picklistValues) {
                                const pickValueName = pickValue.label;
                                const pickValueId = pickValue.value;
                                returnData.push({
                                    name: pickValueName,
                                    value: pickValueId,
                                });
                            }
                        }
                    }
                    (0, GenericFunctions_1.sortOptions)(returnData);
                    return returnData;
                },
                async getTaskPriorities() {
                    const returnData = [];
                    const { fields } = await GenericFunctions_1.salesforceApiRequest.call(this, 'GET', '/sobjects/task/describe');
                    for (const field of fields) {
                        if (field.name === 'Priority') {
                            for (const pickValue of field.picklistValues) {
                                const pickValueName = pickValue.label;
                                const pickValueId = pickValue.value;
                                returnData.push({
                                    name: pickValueName,
                                    value: pickValueId,
                                });
                            }
                        }
                    }
                    (0, GenericFunctions_1.sortOptions)(returnData);
                    return returnData;
                },
                async getTaskRecurrenceTypes() {
                    const returnData = [];
                    const { fields } = await GenericFunctions_1.salesforceApiRequest.call(this, 'GET', '/sobjects/task/describe');
                    for (const field of fields) {
                        if (field.name === 'RecurrenceType') {
                            for (const pickValue of field.picklistValues) {
                                const pickValueName = pickValue.label;
                                const pickValueId = pickValue.value;
                                returnData.push({
                                    name: pickValueName,
                                    value: pickValueId,
                                });
                            }
                        }
                    }
                    (0, GenericFunctions_1.sortOptions)(returnData);
                    return returnData;
                },
                async getTaskRecurrenceInstances() {
                    const returnData = [];
                    const { fields } = await GenericFunctions_1.salesforceApiRequest.call(this, 'GET', '/sobjects/task/describe');
                    for (const field of fields) {
                        if (field.name === 'RecurrenceInstance') {
                            for (const pickValue of field.picklistValues) {
                                const pickValueName = pickValue.label;
                                const pickValueId = pickValue.value;
                                returnData.push({
                                    name: pickValueName,
                                    value: pickValueId,
                                });
                            }
                        }
                    }
                    (0, GenericFunctions_1.sortOptions)(returnData);
                    return returnData;
                },
                async getCustomObjects() {
                    const returnData = [];
                    const { sobjects: objects } = await GenericFunctions_1.salesforceApiRequest.call(this, 'GET', '/sobjects');
                    for (const object of objects) {
                        const objectName = object.label;
                        const objectId = object.name;
                        returnData.push({
                            name: objectName,
                            value: objectId,
                        });
                    }
                    (0, GenericFunctions_1.sortOptions)(returnData);
                    return returnData;
                },
                async getCustomObjectFields() {
                    const returnData = [];
                    const customObject = this.getCurrentNodeParameter('customObject');
                    const { fields } = await GenericFunctions_1.salesforceApiRequest.call(this, 'GET', `/sobjects/${customObject}/describe`);
                    for (const field of fields) {
                        const fieldName = field.label;
                        const fieldId = field.name;
                        returnData.push({
                            name: fieldName,
                            value: fieldId,
                        });
                    }
                    (0, GenericFunctions_1.sortOptions)(returnData);
                    return returnData;
                },
                async getAccountFields() {
                    const returnData = [];
                    const { fields } = await GenericFunctions_1.salesforceApiRequest.call(this, 'GET', '/sobjects/account/describe');
                    for (const field of fields) {
                        const fieldName = field.label;
                        const fieldId = field.name;
                        returnData.push({
                            name: fieldName,
                            value: fieldId,
                        });
                    }
                    (0, GenericFunctions_1.sortOptions)(returnData);
                    return returnData;
                },
                async getAtachmentFields() {
                    const returnData = [];
                    const { fields } = await GenericFunctions_1.salesforceApiRequest.call(this, 'GET', '/sobjects/attachment/describe');
                    for (const field of fields) {
                        const fieldName = field.label;
                        const fieldId = field.name;
                        returnData.push({
                            name: fieldName,
                            value: fieldId,
                        });
                    }
                    (0, GenericFunctions_1.sortOptions)(returnData);
                    return returnData;
                },
                async getCaseFields() {
                    const returnData = [];
                    const { fields } = await GenericFunctions_1.salesforceApiRequest.call(this, 'GET', '/sobjects/case/describe');
                    for (const field of fields) {
                        const fieldName = field.label;
                        const fieldId = field.name;
                        returnData.push({
                            name: fieldName,
                            value: fieldId,
                        });
                    }
                    (0, GenericFunctions_1.sortOptions)(returnData);
                    return returnData;
                },
                async getLeadFields() {
                    const returnData = [];
                    const { fields } = await GenericFunctions_1.salesforceApiRequest.call(this, 'GET', '/sobjects/lead/describe');
                    for (const field of fields) {
                        const fieldName = field.label;
                        const fieldId = field.name;
                        returnData.push({
                            name: fieldName,
                            value: fieldId,
                        });
                    }
                    (0, GenericFunctions_1.sortOptions)(returnData);
                    return returnData;
                },
                async getOpportunityFields() {
                    const returnData = [];
                    const { fields } = await GenericFunctions_1.salesforceApiRequest.call(this, 'GET', '/sobjects/opportunity/describe');
                    for (const field of fields) {
                        const fieldName = field.label;
                        const fieldId = field.name;
                        returnData.push({
                            name: fieldName,
                            value: fieldId,
                        });
                    }
                    (0, GenericFunctions_1.sortOptions)(returnData);
                    return returnData;
                },
                async getTaskFields() {
                    const returnData = [];
                    const { fields } = await GenericFunctions_1.salesforceApiRequest.call(this, 'GET', '/sobjects/task/describe');
                    for (const field of fields) {
                        const fieldName = field.label;
                        const fieldId = field.name;
                        returnData.push({
                            name: fieldName,
                            value: fieldId,
                        });
                    }
                    (0, GenericFunctions_1.sortOptions)(returnData);
                    return returnData;
                },
                async getUserFields() {
                    const returnData = [];
                    const { fields } = await GenericFunctions_1.salesforceApiRequest.call(this, 'GET', '/sobjects/user/describe');
                    for (const field of fields) {
                        const fieldName = field.label;
                        const fieldId = field.name;
                        returnData.push({
                            name: fieldName,
                            value: fieldId,
                        });
                    }
                    (0, GenericFunctions_1.sortOptions)(returnData);
                    return returnData;
                },
                async getContactFields() {
                    const returnData = [];
                    const { fields } = await GenericFunctions_1.salesforceApiRequest.call(this, 'GET', '/sobjects/contact/describe');
                    for (const field of fields) {
                        const fieldName = field.label;
                        const fieldId = field.name;
                        returnData.push({
                            name: fieldName,
                            value: fieldId,
                        });
                    }
                    (0, GenericFunctions_1.sortOptions)(returnData);
                    return returnData;
                },
            },
        };
    }
    async execute() {
        var _a, _b;
        const items = this.getInputData();
        const returnData = [];
        let responseData;
        const qs = {};
        const resource = this.getNodeParameter('resource', 0);
        const operation = this.getNodeParameter('operation', 0);
        const useBulkApi = this.getNodeParameter('useBulkApi', 0);
        const customObject = this.getNodeParameter('customObject', 0);
        const externalId = this.getNodeParameter('externalId', 0);
        console.log('useBulkApi', useBulkApi);
        console.log('customObject', customObject);
        console.log('externalId', externalId);
        this.logger.debug(`Running "Salesforce" node named "${this.getNode.name}" resource "${resource}" operation "${operation}"`);
        if (operation === 'upsert' && useBulkApi === true) {
            const bodies = [];
            for (let i = 0; i < items.length; i++) {
                const customFieldsUi = this.getNodeParameter('customFieldsUi', i);
                const additionalFields = this.getNodeParameter('additionalFields', i);
                const body = {};
                if (customFieldsUi) {
                    const customFields = customFieldsUi.customFieldsValues;
                    if (customFields) {
                        for (const customField of customFields) {
                            body[customField.fieldId] = customField.value;
                        }
                    }
                }
                if (additionalFields.recordTypeId) {
                    body.RecordTypeId = additionalFields.recordTypeId;
                }
                const externalIdValue = this.getNodeParameter('externalIdValue', i);
                body[externalId] = externalIdValue;
                bodies.push(body);
            }
            const csvContent2 = (0, GenericFunctions_1.jsonToCSV)(bodies);
            console.log(csvContent2);
            let body = {
                "object": customObject,
                "externalIdFieldName": externalId,
                "contentType": "CSV",
                "operation": "upsert",
                "lineEnding": "CRLF"
            };
            let createBatch = await GenericFunctions_1.salesforceApiRequest.call(this, 'POST', '/jobs/ingest/', body);
            console.log('createBatch', createBatch);
            console.log('createBatch.contentUrl', createBatch.contentUrl);
            let plainBody = `DebitorNrSAP__c,Name
			1,Thsadfasf Hansi
			2,Thsadfasf Hase
			3,Thsadfasf ICh
			4,Thsadfasf Weiss`;
            plainBody = csvContent2;
            const authenticationMethod = this.getNodeParameter('authentication', 0, 'oAuth2');
            try {
                if (authenticationMethod === 'jwt') {
                }
                else {
                    const credentialsType = 'salesforceOAuth2Api';
                    const credentials = (await this.getCredentials(credentialsType));
                    const options = {
                        headers: {
                            'Content-Type': 'text/csv',
                        },
                        method: 'PUT',
                        body: plainBody,
                        uri: `${credentials.oauthTokenData.instance_url}/services/data/v39.0/jobs/ingest/${createBatch.id}/batches`,
                    };
                    let x = await this.helpers.requestOAuth2.call(this, credentialsType, options);
                    console.log('x', x);
                }
            }
            catch (error) {
                throw new n8n_workflow_1.NodeApiError(this.getNode(), error);
            }
            let closeBatch = await GenericFunctions_1.salesforceApiRequest.call(this, 'PATCH', `/jobs/ingest/${createBatch.id}/`, { "state": "UploadComplete" });
            console.log('createBatch2', closeBatch);
            let status = await GenericFunctions_1.salesforceApiRequest.call(this, 'GET', `/jobs/ingest/${createBatch.id}/`);
            console.log('status', status);
            const waitForJobCompletion = async () => {
                while (status.state !== 'JobComplete' && status.state !== 'falied' && status.state !== 'Aborted' && status.state !== 'Not Processed' && status.state !== 'Failed') {
                    await new Promise(resolve => setTimeout(resolve, 2000));
                    status = await GenericFunctions_1.salesforceApiRequest.call(this, 'GET', `/jobs/ingest/${createBatch.id}/`);
                    console.log('status', status);
                }
            };
            await waitForJobCompletion();
            let successfulResults = await GenericFunctions_1.salesforceApiRequest.call(this, 'GET', `/jobs/ingest/${createBatch.id}/successfulResults/`);
            console.log('successfulResults', successfulResults);
            const jsonArray = (0, GenericFunctions_1.csvToJSON)(successfulResults);
            console.log('jsonArray', jsonArray);
            jsonArray.forEach((element) => {
                returnData.push({ json: element });
            });
        }
        else {
            for (let i = 0; i < items.length; i++) {
                try {
                    if (resource === 'lead') {
                        if (operation === 'create' || operation === 'upsert') {
                            const company = this.getNodeParameter('company', i);
                            const lastname = this.getNodeParameter('lastname', i);
                            const additionalFields = this.getNodeParameter('additionalFields', i);
                            const body = {
                                Company: company,
                                LastName: lastname,
                            };
                            if (additionalFields.hasOptedOutOfEmail !== undefined) {
                                body.HasOptedOutOfEmail = additionalFields.hasOptedOutOfEmail;
                            }
                            if (additionalFields.hasOptedOutOfFax !== undefined) {
                                body.HasOptedOutOfFax = additionalFields.hasOptedOutOfFax;
                            }
                            if (additionalFields.email !== undefined) {
                                body.Email = additionalFields.email;
                            }
                            if (additionalFields.city !== undefined) {
                                body.City = additionalFields.city;
                            }
                            if (additionalFields.phone !== undefined) {
                                body.Phone = additionalFields.phone;
                            }
                            if (additionalFields.state !== undefined) {
                                body.State = additionalFields.state;
                            }
                            if (additionalFields.title !== undefined) {
                                body.Title = additionalFields.title;
                            }
                            if (additionalFields.jigsaw !== undefined) {
                                body.Jigsaw = additionalFields.jigsaw;
                            }
                            if (additionalFields.rating !== undefined) {
                                body.Rating = additionalFields.rating;
                            }
                            if (additionalFields.status !== undefined) {
                                body.Status = additionalFields.status;
                            }
                            if (additionalFields.street !== undefined) {
                                body.Street = additionalFields.street;
                            }
                            if (additionalFields.country !== undefined) {
                                body.Country = additionalFields.country;
                            }
                            if (additionalFields.owner !== undefined) {
                                body.OwnerId = additionalFields.owner;
                            }
                            if (additionalFields.website !== undefined) {
                                body.Website = additionalFields.website;
                            }
                            if (additionalFields.industry !== undefined) {
                                body.Industry = additionalFields.industry;
                            }
                            if (additionalFields.fax !== undefined) {
                                body.Fax = additionalFields.fax;
                            }
                            if (additionalFields.firstname !== undefined) {
                                body.FirstName = additionalFields.firstname;
                            }
                            if (additionalFields.leadSource !== undefined) {
                                body.LeadSource = additionalFields.leadSource;
                            }
                            if (additionalFields.postalCode !== undefined) {
                                body.PostalCode = additionalFields.postalCode;
                            }
                            if (additionalFields.salutation !== undefined) {
                                body.Salutation = additionalFields.salutation;
                            }
                            if (additionalFields.description !== undefined) {
                                body.Description = additionalFields.description;
                            }
                            if (additionalFields.annualRevenue !== undefined) {
                                body.AnnualRevenue = additionalFields.annualRevenue;
                            }
                            if (additionalFields.isUnreadByOwner !== undefined) {
                                body.IsUnreadByOwner = additionalFields.isUnreadByOwner;
                            }
                            if (additionalFields.numberOfEmployees !== undefined) {
                                body.NumberOfEmployees = additionalFields.numberOfEmployees;
                            }
                            if (additionalFields.mobilePhone !== undefined) {
                                body.MobilePhone = additionalFields.mobilePhone;
                            }
                            if (additionalFields.recordTypeId !== undefined) {
                                body.RecordTypeId = additionalFields.recordTypeId;
                            }
                            if (additionalFields.customFieldsUi) {
                                const customFields = additionalFields.customFieldsUi
                                    .customFieldsValues;
                                if (customFields) {
                                    for (const customField of customFields) {
                                        body[customField.fieldId] = customField.value;
                                    }
                                }
                            }
                            let endpoint = '/sobjects/lead';
                            let method = 'POST';
                            if (operation === 'upsert') {
                                method = 'PATCH';
                                const externalId = this.getNodeParameter('externalId', 0);
                                const externalIdValue = this.getNodeParameter('externalIdValue', i);
                                endpoint = `/sobjects/lead/${externalId}/${externalIdValue}`;
                                if (body[externalId] !== undefined) {
                                    delete body[externalId];
                                }
                            }
                            responseData = await GenericFunctions_1.salesforceApiRequest.call(this, method, endpoint, body);
                        }
                        if (operation === 'update') {
                            const leadId = this.getNodeParameter('leadId', i);
                            const updateFields = this.getNodeParameter('updateFields', i);
                            const body = {};
                            if (!Object.keys(updateFields).length) {
                                throw new n8n_workflow_1.NodeOperationError(this.getNode(), 'You must add at least one update field', { itemIndex: i });
                            }
                            if (updateFields.hasOptedOutOfEmail !== undefined) {
                                body.HasOptedOutOfEmail = updateFields.hasOptedOutOfEmail;
                            }
                            if (updateFields.hasOptedOutOfFax !== undefined) {
                                body.hasOptedOutOfFax = updateFields.hasOptedOutOfFax;
                            }
                            if (updateFields.lastname !== undefined) {
                                body.LastName = updateFields.lastname;
                            }
                            if (updateFields.company !== undefined) {
                                body.Company = updateFields.company;
                            }
                            if (updateFields.email !== undefined) {
                                body.Email = updateFields.email;
                            }
                            if (updateFields.city !== undefined) {
                                body.City = updateFields.city;
                            }
                            if (updateFields.phone !== undefined) {
                                body.Phone = updateFields.phone;
                            }
                            if (updateFields.state !== undefined) {
                                body.State = updateFields.state;
                            }
                            if (updateFields.title !== undefined) {
                                body.Title = updateFields.title;
                            }
                            if (updateFields.jigsaw !== undefined) {
                                body.Jigsaw = updateFields.jigsaw;
                            }
                            if (updateFields.rating !== undefined) {
                                body.Rating = updateFields.rating;
                            }
                            if (updateFields.status !== undefined) {
                                body.Status = updateFields.status;
                            }
                            if (updateFields.street !== undefined) {
                                body.Street = updateFields.street;
                            }
                            if (updateFields.country !== undefined) {
                                body.Country = updateFields.country;
                            }
                            if (updateFields.owner !== undefined) {
                                body.OwnerId = updateFields.owner;
                            }
                            if (updateFields.website !== undefined) {
                                body.Website = updateFields.website;
                            }
                            if (updateFields.industry !== undefined) {
                                body.Industry = updateFields.industry;
                            }
                            if (updateFields.firstname !== undefined) {
                                body.FirstName = updateFields.firstname;
                            }
                            if (updateFields.fax !== undefined) {
                                body.Fax = updateFields.fax;
                            }
                            if (updateFields.leadSource !== undefined) {
                                body.LeadSource = updateFields.leadSource;
                            }
                            if (updateFields.postalCode !== undefined) {
                                body.PostalCode = updateFields.postalCode;
                            }
                            if (updateFields.salutation !== undefined) {
                                body.Salutation = updateFields.salutation;
                            }
                            if (updateFields.description !== undefined) {
                                body.Description = updateFields.description;
                            }
                            if (updateFields.annualRevenue !== undefined) {
                                body.AnnualRevenue = updateFields.annualRevenue;
                            }
                            if (updateFields.isUnreadByOwner !== undefined) {
                                body.IsUnreadByOwner = updateFields.isUnreadByOwner;
                            }
                            if (updateFields.numberOfEmployees !== undefined) {
                                body.NumberOfEmployees = updateFields.numberOfEmployees;
                            }
                            if (updateFields.mobilePhone !== undefined) {
                                body.MobilePhone = updateFields.mobilePhone;
                            }
                            if (updateFields.recordTypeId !== undefined) {
                                body.RecordTypeId = updateFields.recordTypeId;
                            }
                            if (updateFields.customFieldsUi) {
                                const customFields = updateFields.customFieldsUi
                                    .customFieldsValues;
                                if (customFields) {
                                    for (const customField of customFields) {
                                        body[customField.fieldId] = customField.value;
                                    }
                                }
                            }
                            responseData = await GenericFunctions_1.salesforceApiRequest.call(this, 'PATCH', `/sobjects/lead/${leadId}`, body);
                        }
                        if (operation === 'get') {
                            const leadId = this.getNodeParameter('leadId', i);
                            responseData = await GenericFunctions_1.salesforceApiRequest.call(this, 'GET', `/sobjects/lead/${leadId}`);
                        }
                        if (operation === 'getAll') {
                            const returnAll = this.getNodeParameter('returnAll', i);
                            const options = this.getNodeParameter('options', i);
                            try {
                                if (returnAll) {
                                    qs.q = (0, GenericFunctions_1.getQuery)(options, 'Lead', returnAll);
                                    responseData = await GenericFunctions_1.salesforceApiRequestAllItems.call(this, 'records', 'GET', '/query', {}, qs);
                                }
                                else {
                                    const limit = this.getNodeParameter('limit', i);
                                    qs.q = (0, GenericFunctions_1.getQuery)(options, 'Lead', returnAll, limit);
                                    responseData = await GenericFunctions_1.salesforceApiRequestAllItems.call(this, 'records', 'GET', '/query', {}, qs);
                                }
                            }
                            catch (error) {
                                throw new n8n_workflow_1.NodeApiError(this.getNode(), error);
                            }
                        }
                        if (operation === 'delete') {
                            const leadId = this.getNodeParameter('leadId', i);
                            try {
                                responseData = await GenericFunctions_1.salesforceApiRequest.call(this, 'DELETE', `/sobjects/lead/${leadId}`);
                            }
                            catch (error) {
                                throw new n8n_workflow_1.NodeApiError(this.getNode(), error);
                            }
                        }
                        if (operation === 'getSummary') {
                            responseData = await GenericFunctions_1.salesforceApiRequest.call(this, 'GET', '/sobjects/lead');
                        }
                        if (operation === 'addToCampaign') {
                            const leadId = this.getNodeParameter('leadId', i);
                            const campaignId = this.getNodeParameter('campaignId', i);
                            const options = this.getNodeParameter('options', i);
                            const body = {
                                LeadId: leadId,
                                CampaignId: campaignId,
                            };
                            if (options.status) {
                                body.Status = options.status;
                            }
                            responseData = await GenericFunctions_1.salesforceApiRequest.call(this, 'POST', '/sobjects/CampaignMember', body);
                        }
                        if (operation === 'addNote') {
                            const leadId = this.getNodeParameter('leadId', i);
                            const title = this.getNodeParameter('title', i);
                            const options = this.getNodeParameter('options', i);
                            const body = {
                                Title: title,
                                ParentId: leadId,
                            };
                            if (options.body) {
                                body.Body = options.body;
                            }
                            if (options.owner) {
                                body.OwnerId = options.owner;
                            }
                            if (options.isPrivate) {
                                body.IsPrivate = options.isPrivate;
                            }
                            responseData = await GenericFunctions_1.salesforceApiRequest.call(this, 'POST', '/sobjects/note', body);
                        }
                    }
                    if (resource === 'contact') {
                        if (operation === 'create' || operation === 'upsert') {
                            const additionalFields = this.getNodeParameter('additionalFields', i);
                            const lastname = this.getNodeParameter('lastname', i);
                            const body = {
                                LastName: lastname,
                            };
                            if (additionalFields.fax !== undefined) {
                                body.Fax = additionalFields.fax;
                            }
                            if (additionalFields.email !== undefined) {
                                body.Email = additionalFields.email;
                            }
                            if (additionalFields.phone !== undefined) {
                                body.Phone = additionalFields.phone;
                            }
                            if (additionalFields.title !== undefined) {
                                body.Title = additionalFields.title;
                            }
                            if (additionalFields.jigsaw !== undefined) {
                                body.Jigsaw = additionalFields.jigsaw;
                            }
                            if (additionalFields.recordTypeId !== undefined) {
                                body.RecordTypeId = additionalFields.recordTypeId;
                            }
                            if (additionalFields.owner !== undefined) {
                                body.OwnerId = additionalFields.owner;
                            }
                            if (additionalFields.acconuntId !== undefined) {
                                body.AccountId = additionalFields.acconuntId;
                            }
                            if (additionalFields.birthdate !== undefined) {
                                body.Birthdate = additionalFields.birthdate;
                            }
                            if (additionalFields.firstName !== undefined) {
                                body.FirstName = additionalFields.firstName;
                            }
                            if (additionalFields.homePhone !== undefined) {
                                body.HomePhone = additionalFields.homePhone;
                            }
                            if (additionalFields.otherCity !== undefined) {
                                body.OtherCity = additionalFields.otherCity;
                            }
                            if (additionalFields.department !== undefined) {
                                body.Department = additionalFields.department;
                            }
                            if (additionalFields.leadSource !== undefined) {
                                body.LeadSource = additionalFields.leadSource;
                            }
                            if (additionalFields.otherPhone !== undefined) {
                                body.OtherPhone = additionalFields.otherPhone;
                            }
                            if (additionalFields.otherState !== undefined) {
                                body.OtherState = additionalFields.otherState;
                            }
                            if (additionalFields.salutation !== undefined) {
                                body.Salutation = additionalFields.salutation;
                            }
                            if (additionalFields.description !== undefined) {
                                body.Description = additionalFields.description;
                            }
                            if (additionalFields.mailingCity !== undefined) {
                                body.MailingCity = additionalFields.mailingCity;
                            }
                            if (additionalFields.mobilePhone !== undefined) {
                                body.MobilePhone = additionalFields.mobilePhone;
                            }
                            if (additionalFields.otherStreet !== undefined) {
                                body.OtherStreet = additionalFields.otherStreet;
                            }
                            if (additionalFields.mailingState !== undefined) {
                                body.MailingState = additionalFields.mailingState;
                            }
                            if (additionalFields.otherCountry !== undefined) {
                                body.OtherCountry = additionalFields.otherCountry;
                            }
                            if (additionalFields.assistantName !== undefined) {
                                body.AssistantName = additionalFields.assistantName;
                            }
                            if (additionalFields.mailingStreet !== undefined) {
                                body.MailingStreet = additionalFields.mailingStreet;
                            }
                            if (additionalFields.assistantPhone !== undefined) {
                                body.AssistantPhone = additionalFields.assistantPhone;
                            }
                            if (additionalFields.mailingCountry !== undefined) {
                                body.MailingCountry = additionalFields.mailingCountry;
                            }
                            if (additionalFields.otherPostalCode !== undefined) {
                                body.OtherPostalCode = additionalFields.otherPostalCode;
                            }
                            if (additionalFields.emailBouncedDate !== undefined) {
                                body.EmailBouncedDate = additionalFields.emailBouncedDate;
                            }
                            if (additionalFields.mailingPostalCode !== undefined) {
                                body.MailingPostalCode = additionalFields.mailingPostalCode;
                            }
                            if (additionalFields.emailBouncedReason !== undefined) {
                                body.EmailBouncedReason = additionalFields.emailBouncedReason;
                            }
                            if (additionalFields.customFieldsUi) {
                                const customFields = additionalFields.customFieldsUi
                                    .customFieldsValues;
                                if (customFields) {
                                    for (const customField of customFields) {
                                        body[customField.fieldId] = customField.value;
                                    }
                                }
                            }
                            let endpoint = '/sobjects/contact';
                            let method = 'POST';
                            if (operation === 'upsert') {
                                method = 'PATCH';
                                const externalId = this.getNodeParameter('externalId', 0);
                                const externalIdValue = this.getNodeParameter('externalIdValue', i);
                                endpoint = `/sobjects/contact/${externalId}/${externalIdValue}`;
                                if (body[externalId] !== undefined) {
                                    delete body[externalId];
                                }
                            }
                            responseData = await GenericFunctions_1.salesforceApiRequest.call(this, method, endpoint, body);
                        }
                        if (operation === 'update') {
                            const contactId = this.getNodeParameter('contactId', i);
                            const updateFields = this.getNodeParameter('updateFields', i);
                            const body = {};
                            if (!Object.keys(updateFields).length) {
                                throw new n8n_workflow_1.NodeOperationError(this.getNode(), 'You must add at least one update field', { itemIndex: i });
                            }
                            if (updateFields.lastName !== undefined) {
                                body.LastName = updateFields.lastName;
                            }
                            if (updateFields.fax !== undefined) {
                                body.Fax = updateFields.fax;
                            }
                            if (updateFields.email !== undefined) {
                                body.Email = updateFields.email;
                            }
                            if (updateFields.recordTypeId !== undefined) {
                                body.RecordTypeId = updateFields.recordTypeId;
                            }
                            if (updateFields.phone !== undefined) {
                                body.Phone = updateFields.phone;
                            }
                            if (updateFields.title !== undefined) {
                                body.Title = updateFields.title;
                            }
                            if (updateFields.jigsaw !== undefined) {
                                body.Jigsaw = updateFields.jigsaw;
                            }
                            if (updateFields.owner !== undefined) {
                                body.OwnerId = updateFields.owner;
                            }
                            if (updateFields.acconuntId !== undefined) {
                                body.AccountId = updateFields.acconuntId;
                            }
                            if (updateFields.birthdate !== undefined) {
                                body.Birthdate = updateFields.birthdate;
                            }
                            if (updateFields.firstName !== undefined) {
                                body.FirstName = updateFields.firstName;
                            }
                            if (updateFields.homePhone !== undefined) {
                                body.HomePhone = updateFields.homePhone;
                            }
                            if (updateFields.otherCity !== undefined) {
                                body.OtherCity = updateFields.otherCity;
                            }
                            if (updateFields.department !== undefined) {
                                body.Department = updateFields.department;
                            }
                            if (updateFields.leadSource !== undefined) {
                                body.LeadSource = updateFields.leadSource;
                            }
                            if (updateFields.otherPhone !== undefined) {
                                body.OtherPhone = updateFields.otherPhone;
                            }
                            if (updateFields.otherState !== undefined) {
                                body.OtherState = updateFields.otherState;
                            }
                            if (updateFields.salutation !== undefined) {
                                body.Salutation = updateFields.salutation;
                            }
                            if (updateFields.description !== undefined) {
                                body.Description = updateFields.description;
                            }
                            if (updateFields.mailingCity !== undefined) {
                                body.MailingCity = updateFields.mailingCity;
                            }
                            if (updateFields.mobilePhone !== undefined) {
                                body.MobilePhone = updateFields.mobilePhone;
                            }
                            if (updateFields.otherStreet !== undefined) {
                                body.OtherStreet = updateFields.otherStreet;
                            }
                            if (updateFields.mailingState !== undefined) {
                                body.MailingState = updateFields.mailingState;
                            }
                            if (updateFields.otherCountry !== undefined) {
                                body.OtherCountry = updateFields.otherCountry;
                            }
                            if (updateFields.assistantName !== undefined) {
                                body.AssistantName = updateFields.assistantName;
                            }
                            if (updateFields.mailingStreet !== undefined) {
                                body.MailingStreet = updateFields.mailingStreet;
                            }
                            if (updateFields.assistantPhone !== undefined) {
                                body.AssistantPhone = updateFields.assistantPhone;
                            }
                            if (updateFields.mailingCountry !== undefined) {
                                body.MailingCountry = updateFields.mailingCountry;
                            }
                            if (updateFields.otherPostalCode !== undefined) {
                                body.OtherPostalCode = updateFields.otherPostalCode;
                            }
                            if (updateFields.emailBouncedDate !== undefined) {
                                body.EmailBouncedDate = updateFields.emailBouncedDate;
                            }
                            if (updateFields.mailingPostalCode !== undefined) {
                                body.MailingPostalCode = updateFields.mailingPostalCode;
                            }
                            if (updateFields.emailBouncedReason !== undefined) {
                                body.EmailBouncedReason = updateFields.emailBouncedReason;
                            }
                            if (updateFields.customFieldsUi) {
                                const customFields = updateFields.customFieldsUi
                                    .customFieldsValues;
                                if (customFields) {
                                    for (const customField of customFields) {
                                        body[customField.fieldId] = customField.value;
                                    }
                                }
                            }
                            responseData = await GenericFunctions_1.salesforceApiRequest.call(this, 'PATCH', `/sobjects/contact/${contactId}`, body);
                        }
                        if (operation === 'get') {
                            const contactId = this.getNodeParameter('contactId', i);
                            responseData = await GenericFunctions_1.salesforceApiRequest.call(this, 'GET', `/sobjects/contact/${contactId}`);
                        }
                        if (operation === 'getAll') {
                            const returnAll = this.getNodeParameter('returnAll', i);
                            const options = this.getNodeParameter('options', i);
                            try {
                                if (returnAll) {
                                    qs.q = (0, GenericFunctions_1.getQuery)(options, 'Contact', returnAll);
                                    responseData = await GenericFunctions_1.salesforceApiRequestAllItems.call(this, 'records', 'GET', '/query', {}, qs);
                                }
                                else {
                                    const limit = this.getNodeParameter('limit', i);
                                    qs.q = (0, GenericFunctions_1.getQuery)(options, 'Contact', returnAll, limit);
                                    responseData = await GenericFunctions_1.salesforceApiRequestAllItems.call(this, 'records', 'GET', '/query', {}, qs);
                                }
                            }
                            catch (error) {
                                throw new n8n_workflow_1.NodeApiError(this.getNode(), error);
                            }
                        }
                        if (operation === 'delete') {
                            const contactId = this.getNodeParameter('contactId', i);
                            try {
                                responseData = await GenericFunctions_1.salesforceApiRequest.call(this, 'DELETE', `/sobjects/contact/${contactId}`);
                            }
                            catch (error) {
                                throw new n8n_workflow_1.NodeApiError(this.getNode(), error);
                            }
                        }
                        if (operation === 'getSummary') {
                            responseData = await GenericFunctions_1.salesforceApiRequest.call(this, 'GET', '/sobjects/contact');
                        }
                        if (operation === 'addToCampaign') {
                            const contactId = this.getNodeParameter('contactId', i);
                            const campaignId = this.getNodeParameter('campaignId', i);
                            const options = this.getNodeParameter('options', i);
                            const body = {
                                ContactId: contactId,
                                CampaignId: campaignId,
                            };
                            if (options.status) {
                                body.Status = options.status;
                            }
                            responseData = await GenericFunctions_1.salesforceApiRequest.call(this, 'POST', '/sobjects/CampaignMember', body);
                        }
                        if (operation === 'addNote') {
                            const contactId = this.getNodeParameter('contactId', i);
                            const title = this.getNodeParameter('title', i);
                            const options = this.getNodeParameter('options', i);
                            const body = {
                                Title: title,
                                ParentId: contactId,
                            };
                            if (options.body !== undefined) {
                                body.Body = options.body;
                            }
                            if (options.owner !== undefined) {
                                body.OwnerId = options.owner;
                            }
                            if (options.isPrivate !== undefined) {
                                body.IsPrivate = options.isPrivate;
                            }
                            responseData = await GenericFunctions_1.salesforceApiRequest.call(this, 'POST', '/sobjects/note', body);
                        }
                    }
                    if (resource === 'customObject') {
                        if (operation === 'create' || operation === 'upsert') {
                            const customObject = this.getNodeParameter('customObject', i);
                            const customFieldsUi = this.getNodeParameter('customFieldsUi', i);
                            const additionalFields = this.getNodeParameter('additionalFields', i);
                            const body = {};
                            if (customFieldsUi) {
                                const customFields = customFieldsUi.customFieldsValues;
                                if (customFields) {
                                    for (const customField of customFields) {
                                        body[customField.fieldId] = customField.value;
                                    }
                                }
                            }
                            if (additionalFields.recordTypeId) {
                                body.RecordTypeId = additionalFields.recordTypeId;
                            }
                            let endpoint = `/sobjects/${customObject}`;
                            let method = 'POST';
                            if (operation === 'upsert') {
                                method = 'PATCH';
                                const externalId = this.getNodeParameter('externalId', 0);
                                const externalIdValue = this.getNodeParameter('externalIdValue', i);
                                endpoint = `/sobjects/${customObject}/${externalId}/${externalIdValue}`;
                                if (body[externalId] !== undefined) {
                                    delete body[externalId];
                                }
                            }
                            responseData = await GenericFunctions_1.salesforceApiRequest.call(this, method, endpoint, body);
                        }
                        if (operation === 'update') {
                            const recordId = this.getNodeParameter('recordId', i);
                            const customObject = this.getNodeParameter('customObject', i);
                            const customFieldsUi = this.getNodeParameter('customFieldsUi', i);
                            const updateFields = this.getNodeParameter('updateFields', i);
                            const body = {};
                            if (updateFields.recordTypeId) {
                                body.RecordTypeId = updateFields.recordTypeId;
                            }
                            if (customFieldsUi) {
                                const customFields = customFieldsUi.customFieldsValues;
                                if (customFields) {
                                    for (const customField of customFields) {
                                        body[customField.fieldId] = customField.value;
                                    }
                                }
                            }
                            responseData = await GenericFunctions_1.salesforceApiRequest.call(this, 'PATCH', `/sobjects/${customObject}/${recordId}`, body);
                        }
                        if (operation === 'get') {
                            const customObject = this.getNodeParameter('customObject', i);
                            const recordId = this.getNodeParameter('recordId', i);
                            responseData = await GenericFunctions_1.salesforceApiRequest.call(this, 'GET', `/sobjects/${customObject}/${recordId}`);
                        }
                        if (operation === 'getAll') {
                            const customObject = this.getNodeParameter('customObject', i);
                            const returnAll = this.getNodeParameter('returnAll', i);
                            const options = this.getNodeParameter('options', i);
                            try {
                                if (returnAll) {
                                    qs.q = (0, GenericFunctions_1.getQuery)(options, customObject, returnAll);
                                    responseData = await GenericFunctions_1.salesforceApiRequestAllItems.call(this, 'records', 'GET', '/query', {}, qs);
                                }
                                else {
                                    const limit = this.getNodeParameter('limit', i);
                                    qs.q = (0, GenericFunctions_1.getQuery)(options, customObject, returnAll, limit);
                                    responseData = await GenericFunctions_1.salesforceApiRequestAllItems.call(this, 'records', 'GET', '/query', {}, qs);
                                }
                            }
                            catch (error) {
                                throw new n8n_workflow_1.NodeApiError(this.getNode(), error);
                            }
                        }
                        if (operation === 'delete') {
                            const customObject = this.getNodeParameter('customObject', i);
                            const recordId = this.getNodeParameter('recordId', i);
                            try {
                                responseData = await GenericFunctions_1.salesforceApiRequest.call(this, 'DELETE', `/sobjects/${customObject}/${recordId}`);
                            }
                            catch (error) {
                                throw new n8n_workflow_1.NodeApiError(this.getNode(), error);
                            }
                        }
                    }
                    if (resource === 'document') {
                        if (operation === 'upload') {
                            const title = this.getNodeParameter('title', i);
                            const additionalFields = this.getNodeParameter('additionalFields', i);
                            const binaryPropertyName = this.getNodeParameter('binaryPropertyName', i);
                            const body = {
                                entity_content: {
                                    Title: title,
                                    ContentLocation: 'S',
                                },
                            };
                            if (additionalFields.ownerId) {
                                body.entity_content.ownerId = additionalFields.ownerId;
                            }
                            if (additionalFields.linkToObjectId) {
                                body.entity_content.FirstPublishLocationId =
                                    additionalFields.linkToObjectId;
                            }
                            const binaryData = this.helpers.assertBinaryData(i, binaryPropertyName);
                            const dataBuffer = await this.helpers.getBinaryDataBuffer(i, binaryPropertyName);
                            body.entity_content.PathOnClient = `${title}.${additionalFields.fileExtension || binaryData.fileExtension}`;
                            const data = {
                                entity_content: {
                                    value: JSON.stringify(body.entity_content),
                                    options: {
                                        contentType: 'application/json',
                                    },
                                },
                                VersionData: {
                                    value: dataBuffer,
                                    options: {
                                        filename: body.entity_content.PathOnClient,
                                    },
                                },
                            };
                            responseData = await GenericFunctions_1.salesforceApiRequest.call(this, 'POST', '/sobjects/ContentVersion', {}, {}, undefined, { formData: data });
                        }
                    }
                    if (resource === 'opportunity') {
                        if (operation === 'create' || operation === 'upsert') {
                            const name = this.getNodeParameter('name', i);
                            const closeDate = this.getNodeParameter('closeDate', i);
                            const stageName = this.getNodeParameter('stageName', i);
                            const additionalFields = this.getNodeParameter('additionalFields', i);
                            const body = {
                                Name: name,
                                CloseDate: closeDate,
                                StageName: stageName,
                            };
                            if (additionalFields.type !== undefined) {
                                body.Type = additionalFields.type;
                            }
                            if (additionalFields.amount !== undefined) {
                                body.Amount = additionalFields.amount;
                            }
                            if (additionalFields.owner !== undefined) {
                                body.OwnerId = additionalFields.owner;
                            }
                            if (additionalFields.nextStep !== undefined) {
                                body.NextStep = additionalFields.nextStep;
                            }
                            if (additionalFields.accountId !== undefined) {
                                body.AccountId = additionalFields.accountId;
                            }
                            if (additionalFields.campaignId !== undefined) {
                                body.CampaignId = additionalFields.campaignId;
                            }
                            if (additionalFields.leadSource !== undefined) {
                                body.LeadSource = additionalFields.leadSource;
                            }
                            if (additionalFields.description !== undefined) {
                                body.Description = additionalFields.description;
                            }
                            if (additionalFields.probability !== undefined) {
                                body.Probability = additionalFields.probability;
                            }
                            if (additionalFields.pricebook2Id !== undefined) {
                                body.Pricebook2Id = additionalFields.pricebook2Id;
                            }
                            if (additionalFields.forecastCategoryName !== undefined) {
                                body.ForecastCategoryName = additionalFields.forecastCategoryName;
                            }
                            if (additionalFields.customFieldsUi) {
                                const customFields = additionalFields.customFieldsUi
                                    .customFieldsValues;
                                if (customFields) {
                                    for (const customField of customFields) {
                                        body[customField.fieldId] = customField.value;
                                    }
                                }
                            }
                            let endpoint = '/sobjects/opportunity';
                            let method = 'POST';
                            if (operation === 'upsert') {
                                method = 'PATCH';
                                const externalId = this.getNodeParameter('externalId', 0);
                                const externalIdValue = this.getNodeParameter('externalIdValue', i);
                                endpoint = `/sobjects/opportunity/${externalId}/${externalIdValue}`;
                                if (body[externalId] !== undefined) {
                                    delete body[externalId];
                                }
                            }
                            responseData = await GenericFunctions_1.salesforceApiRequest.call(this, method, endpoint, body);
                        }
                        if (operation === 'update') {
                            const opportunityId = this.getNodeParameter('opportunityId', i);
                            const updateFields = this.getNodeParameter('updateFields', i);
                            const body = {};
                            if (updateFields.name !== undefined) {
                                body.Name = updateFields.name;
                            }
                            if (updateFields.closeDate !== undefined) {
                                body.CloseDate = updateFields.closeDate;
                            }
                            if (updateFields.stageName !== undefined) {
                                body.StageName = updateFields.stageName;
                            }
                            if (updateFields.type !== undefined) {
                                body.Type = updateFields.type;
                            }
                            if (updateFields.amount !== undefined) {
                                body.Amount = updateFields.amount;
                            }
                            if (updateFields.owner !== undefined) {
                                body.OwnerId = updateFields.owner;
                            }
                            if (updateFields.nextStep !== undefined) {
                                body.NextStep = updateFields.nextStep;
                            }
                            if (updateFields.accountId !== undefined) {
                                body.AccountId = updateFields.accountId;
                            }
                            if (updateFields.campaignId !== undefined) {
                                body.CampaignId = updateFields.campaignId;
                            }
                            if (updateFields.leadSource !== undefined) {
                                body.LeadSource = updateFields.leadSource;
                            }
                            if (updateFields.description !== undefined) {
                                body.Description = updateFields.description;
                            }
                            if (updateFields.probability !== undefined) {
                                body.Probability = updateFields.probability;
                            }
                            if (updateFields.pricebook2Id !== undefined) {
                                body.Pricebook2Id = updateFields.pricebook2Id;
                            }
                            if (updateFields.forecastCategoryName !== undefined) {
                                body.ForecastCategoryName = updateFields.forecastCategoryName;
                            }
                            if (updateFields.customFieldsUi) {
                                const customFields = updateFields.customFieldsUi
                                    .customFieldsValues;
                                if (customFields) {
                                    for (const customField of customFields) {
                                        body[customField.fieldId] = customField.value;
                                    }
                                }
                            }
                            responseData = await GenericFunctions_1.salesforceApiRequest.call(this, 'PATCH', `/sobjects/opportunity/${opportunityId}`, body);
                        }
                        if (operation === 'get') {
                            const opportunityId = this.getNodeParameter('opportunityId', i);
                            responseData = await GenericFunctions_1.salesforceApiRequest.call(this, 'GET', `/sobjects/opportunity/${opportunityId}`);
                        }
                        if (operation === 'getAll') {
                            const returnAll = this.getNodeParameter('returnAll', i);
                            const options = this.getNodeParameter('options', i);
                            try {
                                if (returnAll) {
                                    qs.q = (0, GenericFunctions_1.getQuery)(options, 'Opportunity', returnAll);
                                    responseData = await GenericFunctions_1.salesforceApiRequestAllItems.call(this, 'records', 'GET', '/query', {}, qs);
                                }
                                else {
                                    const limit = this.getNodeParameter('limit', i);
                                    qs.q = (0, GenericFunctions_1.getQuery)(options, 'Opportunity', returnAll, limit);
                                    responseData = await GenericFunctions_1.salesforceApiRequestAllItems.call(this, 'records', 'GET', '/query', {}, qs);
                                }
                            }
                            catch (error) {
                                throw new n8n_workflow_1.NodeApiError(this.getNode(), error);
                            }
                        }
                        if (operation === 'delete') {
                            const opportunityId = this.getNodeParameter('opportunityId', i);
                            try {
                                responseData = await GenericFunctions_1.salesforceApiRequest.call(this, 'DELETE', `/sobjects/opportunity/${opportunityId}`);
                            }
                            catch (error) {
                                throw new n8n_workflow_1.NodeApiError(this.getNode(), error);
                            }
                        }
                        if (operation === 'getSummary') {
                            responseData = await GenericFunctions_1.salesforceApiRequest.call(this, 'GET', '/sobjects/opportunity');
                        }
                        if (operation === 'addNote') {
                            const opportunityId = this.getNodeParameter('opportunityId', i);
                            const title = this.getNodeParameter('title', i);
                            const options = this.getNodeParameter('options', i);
                            const body = {
                                Title: title,
                                ParentId: opportunityId,
                            };
                            if (options.body !== undefined) {
                                body.Body = options.body;
                            }
                            if (options.owner !== undefined) {
                                body.OwnerId = options.owner;
                            }
                            if (options.isPrivate !== undefined) {
                                body.IsPrivate = options.isPrivate;
                            }
                            responseData = await GenericFunctions_1.salesforceApiRequest.call(this, 'POST', '/sobjects/note', body);
                        }
                    }
                    if (resource === 'account') {
                        if (operation === 'create' || operation === 'upsert') {
                            const additionalFields = this.getNodeParameter('additionalFields', i);
                            const name = this.getNodeParameter('name', i);
                            const body = {
                                Name: name,
                            };
                            if (additionalFields.fax !== undefined) {
                                body.Fax = additionalFields.fax;
                            }
                            if (additionalFields.type !== undefined) {
                                body.Type = additionalFields.type;
                            }
                            if (additionalFields.jigsaw !== undefined) {
                                body.Jigsaw = additionalFields.jigsaw;
                            }
                            if (additionalFields.phone !== undefined) {
                                body.Phone = additionalFields.phone;
                            }
                            if (additionalFields.owner !== undefined) {
                                body.OwnerId = additionalFields.owner;
                            }
                            if (additionalFields.sicDesc !== undefined) {
                                body.SicDesc = additionalFields.sicDesc;
                            }
                            if (additionalFields.website !== undefined) {
                                body.Website = additionalFields.website;
                            }
                            if (additionalFields.industry !== undefined) {
                                body.Industry = additionalFields.industry;
                            }
                            if (additionalFields.parentId !== undefined) {
                                body.ParentId = additionalFields.parentId;
                            }
                            if (additionalFields.billingCity !== undefined) {
                                body.BillingCity = additionalFields.billingCity;
                            }
                            if (additionalFields.description !== undefined) {
                                body.Description = additionalFields.description;
                            }
                            if (additionalFields.billingState !== undefined) {
                                body.BillingState = additionalFields.billingState;
                            }
                            if (additionalFields.shippingCity !== undefined) {
                                body.ShippingCity = additionalFields.shippingCity;
                            }
                            if (additionalFields.accountNumber !== undefined) {
                                body.AccountNumber = additionalFields.accountNumber;
                            }
                            if (additionalFields.accountSource !== undefined) {
                                body.AccountSource = additionalFields.accountSource;
                            }
                            if (additionalFields.annualRevenue !== undefined) {
                                body.AnnualRevenue = additionalFields.annualRevenue;
                            }
                            if (additionalFields.billingStreet !== undefined) {
                                body.BillingStreet = additionalFields.billingStreet;
                            }
                            if (additionalFields.shippingState !== undefined) {
                                body.ShippingState = additionalFields.shippingState;
                            }
                            if (additionalFields.billingCountry !== undefined) {
                                body.BillingCountry = additionalFields.billingCountry;
                            }
                            if (additionalFields.shippingStreet !== undefined) {
                                body.ShippingStreet = additionalFields.shippingStreet;
                            }
                            if (additionalFields.shippingCountry !== undefined) {
                                body.ShippingCountry = additionalFields.shippingCountry;
                            }
                            if (additionalFields.billingPostalCode !== undefined) {
                                body.BillingPostalCode = additionalFields.billingPostalCode;
                            }
                            if (additionalFields.numberOfEmployees !== undefined) {
                                body.NumberOfEmployees = additionalFields.numberOfEmployees;
                            }
                            if (additionalFields.shippingPostalCode !== undefined) {
                                body.ShippingPostalCode = additionalFields.shippingPostalCode;
                            }
                            if (additionalFields.shippingPostalCode !== undefined) {
                                body.ShippingPostalCode = additionalFields.shippingPostalCode;
                            }
                            if (additionalFields.recordTypeId !== undefined) {
                                body.RecordTypeId = additionalFields.recordTypeId;
                            }
                            if (additionalFields.customFieldsUi) {
                                const customFields = additionalFields.customFieldsUi
                                    .customFieldsValues;
                                if (customFields) {
                                    for (const customField of customFields) {
                                        body[customField.fieldId] = customField.value;
                                    }
                                }
                            }
                            let endpoint = '/sobjects/account';
                            let method = 'POST';
                            if (operation === 'upsert') {
                                method = 'PATCH';
                                const externalId = this.getNodeParameter('externalId', 0);
                                const externalIdValue = this.getNodeParameter('externalIdValue', i);
                                endpoint = `/sobjects/account/${externalId}/${externalIdValue}`;
                                if (body[externalId] !== undefined) {
                                    delete body[externalId];
                                }
                            }
                            responseData = await GenericFunctions_1.salesforceApiRequest.call(this, method, endpoint, body);
                        }
                        if (operation === 'update') {
                            const accountId = this.getNodeParameter('accountId', i);
                            const updateFields = this.getNodeParameter('updateFields', i);
                            const body = {};
                            if (updateFields.name !== undefined) {
                                body.Name = updateFields.name;
                            }
                            if (updateFields.fax !== undefined) {
                                body.Fax = updateFields.fax;
                            }
                            if (updateFields.type !== undefined) {
                                body.Type = updateFields.type;
                            }
                            if (updateFields.jigsaw !== undefined) {
                                body.Jigsaw = updateFields.jigsaw;
                            }
                            if (updateFields.phone !== undefined) {
                                body.Phone = updateFields.phone;
                            }
                            if (updateFields.ownerId !== undefined) {
                                body.OwnerId = updateFields.ownerId;
                            }
                            if (updateFields.sicDesc !== undefined) {
                                body.SicDesc = updateFields.sicDesc;
                            }
                            if (updateFields.recordTypeId !== undefined) {
                                body.RecordTypeId = updateFields.recordTypeId;
                            }
                            if (updateFields.website !== undefined) {
                                body.Website = updateFields.website;
                            }
                            if (updateFields.industry !== undefined) {
                                body.Industry = updateFields.industry;
                            }
                            if (updateFields.parentId !== undefined) {
                                body.ParentId = updateFields.parentId;
                            }
                            if (updateFields.billingCity !== undefined) {
                                body.BillingCity = updateFields.billingCity;
                            }
                            if (updateFields.description !== undefined) {
                                body.Description = updateFields.description;
                            }
                            if (updateFields.billingState !== undefined) {
                                body.BillingState = updateFields.billingState;
                            }
                            if (updateFields.shippingCity !== undefined) {
                                body.ShippingCity = updateFields.shippingCity;
                            }
                            if (updateFields.accountNumber !== undefined) {
                                body.AccountNumber = updateFields.accountNumber;
                            }
                            if (updateFields.accountSource !== undefined) {
                                body.AccountSource = updateFields.accountSource;
                            }
                            if (updateFields.annualRevenue !== undefined) {
                                body.AnnualRevenue = updateFields.annualRevenue;
                            }
                            if (updateFields.billingStreet !== undefined) {
                                body.BillingStreet = updateFields.billingStreet;
                            }
                            if (updateFields.shippingState !== undefined) {
                                body.ShippingState = updateFields.shippingState;
                            }
                            if (updateFields.billingCountry !== undefined) {
                                body.BillingCountry = updateFields.billingCountry;
                            }
                            if (updateFields.shippingStreet !== undefined) {
                                body.ShippingStreet = updateFields.shippingStreet;
                            }
                            if (updateFields.shippingCountry !== undefined) {
                                body.ShippingCountry = updateFields.shippingCountry;
                            }
                            if (updateFields.billingPostalCode !== undefined) {
                                body.BillingPostalCode = updateFields.billingPostalCode;
                            }
                            if (updateFields.numberOfEmployees !== undefined) {
                                body.NumberOfEmployees = updateFields.numberOfEmployees;
                            }
                            if (updateFields.shippingPostalCode !== undefined) {
                                body.ShippingPostalCode = updateFields.shippingPostalCode;
                            }
                            if (updateFields.shippingPostalCode !== undefined) {
                                body.ShippingPostalCode = updateFields.shippingPostalCode;
                            }
                            if (updateFields.customFieldsUi) {
                                const customFields = updateFields.customFieldsUi
                                    .customFieldsValues;
                                if (customFields) {
                                    for (const customField of customFields) {
                                        body[customField.fieldId] = customField.value;
                                    }
                                }
                            }
                            responseData = await GenericFunctions_1.salesforceApiRequest.call(this, 'PATCH', `/sobjects/account/${accountId}`, body);
                        }
                        if (operation === 'get') {
                            const accountId = this.getNodeParameter('accountId', i);
                            responseData = await GenericFunctions_1.salesforceApiRequest.call(this, 'GET', `/sobjects/account/${accountId}`);
                        }
                        if (operation === 'getAll') {
                            const returnAll = this.getNodeParameter('returnAll', i);
                            const options = this.getNodeParameter('options', i);
                            try {
                                if (returnAll) {
                                    qs.q = (0, GenericFunctions_1.getQuery)(options, 'Account', returnAll);
                                    responseData = await GenericFunctions_1.salesforceApiRequestAllItems.call(this, 'records', 'GET', '/query', {}, qs);
                                }
                                else {
                                    const limit = this.getNodeParameter('limit', i);
                                    qs.q = (0, GenericFunctions_1.getQuery)(options, 'Account', returnAll, limit);
                                    responseData = await GenericFunctions_1.salesforceApiRequestAllItems.call(this, 'records', 'GET', '/query', {}, qs);
                                }
                            }
                            catch (error) {
                                throw new n8n_workflow_1.NodeApiError(this.getNode(), error);
                            }
                        }
                        if (operation === 'delete') {
                            const accountId = this.getNodeParameter('accountId', i);
                            try {
                                responseData = await GenericFunctions_1.salesforceApiRequest.call(this, 'DELETE', `/sobjects/account/${accountId}`);
                            }
                            catch (error) {
                                throw new n8n_workflow_1.NodeApiError(this.getNode(), error);
                            }
                        }
                        if (operation === 'getSummary') {
                            responseData = await GenericFunctions_1.salesforceApiRequest.call(this, 'GET', '/sobjects/account');
                        }
                        if (operation === 'addNote') {
                            const accountId = this.getNodeParameter('accountId', i);
                            const title = this.getNodeParameter('title', i);
                            const options = this.getNodeParameter('options', i);
                            const body = {
                                Title: title,
                                ParentId: accountId,
                            };
                            if (options.body !== undefined) {
                                body.Body = options.body;
                            }
                            if (options.owner !== undefined) {
                                body.OwnerId = options.owner;
                            }
                            if (options.isPrivate !== undefined) {
                                body.IsPrivate = options.isPrivate;
                            }
                            responseData = await GenericFunctions_1.salesforceApiRequest.call(this, 'POST', '/sobjects/note', body);
                        }
                    }
                    if (resource === 'case') {
                        if (operation === 'create') {
                            const type = this.getNodeParameter('type', i);
                            const additionalFields = this.getNodeParameter('additionalFields', i);
                            const body = {
                                Type: type,
                            };
                            if (additionalFields.origin !== undefined) {
                                body.Origin = additionalFields.origin;
                            }
                            if (additionalFields.reason !== undefined) {
                                body.Reason = additionalFields.reason;
                            }
                            if (additionalFields.status !== undefined) {
                                body.Status = additionalFields.status;
                            }
                            if (additionalFields.owner !== undefined) {
                                body.OwnerId = additionalFields.owner;
                            }
                            if (additionalFields.subject !== undefined) {
                                body.Subject = additionalFields.subject;
                            }
                            if (additionalFields.parentId !== undefined) {
                                body.ParentId = additionalFields.parentId;
                            }
                            if (additionalFields.priority !== undefined) {
                                body.Priority = additionalFields.priority;
                            }
                            if (additionalFields.accountId !== undefined) {
                                body.AccountId = additionalFields.accountId;
                            }
                            if (additionalFields.contactId !== undefined) {
                                body.ContactId = additionalFields.contactId;
                            }
                            if (additionalFields.description !== undefined) {
                                body.Description = additionalFields.description;
                            }
                            if (additionalFields.isEscalated !== undefined) {
                                body.IsEscalated = additionalFields.isEscalated;
                            }
                            if (additionalFields.suppliedName !== undefined) {
                                body.SuppliedName = additionalFields.suppliedName;
                            }
                            if (additionalFields.suppliedEmail !== undefined) {
                                body.SuppliedEmail = additionalFields.suppliedEmail;
                            }
                            if (additionalFields.suppliedPhone !== undefined) {
                                body.SuppliedPhone = additionalFields.suppliedPhone;
                            }
                            if (additionalFields.suppliedCompany !== undefined) {
                                body.SuppliedCompany = additionalFields.suppliedCompany;
                            }
                            if (additionalFields.recordTypeId !== undefined) {
                                body.RecordTypeId = additionalFields.recordTypeId;
                            }
                            if (additionalFields.customFieldsUi) {
                                const customFields = additionalFields.customFieldsUi
                                    .customFieldsValues;
                                if (customFields) {
                                    for (const customField of customFields) {
                                        body[customField.fieldId] = customField.value;
                                    }
                                }
                            }
                            responseData = await GenericFunctions_1.salesforceApiRequest.call(this, 'POST', '/sobjects/case', body);
                        }
                        if (operation === 'update') {
                            const caseId = this.getNodeParameter('caseId', i);
                            const updateFields = this.getNodeParameter('updateFields', i);
                            const body = {};
                            if (updateFields.type !== undefined) {
                                body.Type = updateFields.type;
                            }
                            if (updateFields.origin !== undefined) {
                                body.Origin = updateFields.origin;
                            }
                            if (updateFields.reason !== undefined) {
                                body.Reason = updateFields.reason;
                            }
                            if (updateFields.status !== undefined) {
                                body.Status = updateFields.status;
                            }
                            if (updateFields.owner !== undefined) {
                                body.OwnerId = updateFields.owner;
                            }
                            if (updateFields.subject !== undefined) {
                                body.Subject = updateFields.subject;
                            }
                            if (updateFields.parentId !== undefined) {
                                body.ParentId = updateFields.parentId;
                            }
                            if (updateFields.priority !== undefined) {
                                body.Priority = updateFields.priority;
                            }
                            if (updateFields.accountId !== undefined) {
                                body.AccountId = updateFields.accountId;
                            }
                            if (updateFields.recordTypeId !== undefined) {
                                body.RecordTypeId = updateFields.recordTypeId;
                            }
                            if (updateFields.contactId !== undefined) {
                                body.ContactId = updateFields.contactId;
                            }
                            if (updateFields.description !== undefined) {
                                body.Description = updateFields.description;
                            }
                            if (updateFields.isEscalated !== undefined) {
                                body.IsEscalated = updateFields.isEscalated;
                            }
                            if (updateFields.suppliedName !== undefined) {
                                body.SuppliedName = updateFields.suppliedName;
                            }
                            if (updateFields.suppliedEmail !== undefined) {
                                body.SuppliedEmail = updateFields.suppliedEmail;
                            }
                            if (updateFields.suppliedPhone !== undefined) {
                                body.SuppliedPhone = updateFields.suppliedPhone;
                            }
                            if (updateFields.suppliedCompany !== undefined) {
                                body.SuppliedCompany = updateFields.suppliedCompany;
                            }
                            if (updateFields.customFieldsUi) {
                                const customFields = updateFields.customFieldsUi
                                    .customFieldsValues;
                                if (customFields) {
                                    for (const customField of customFields) {
                                        body[customField.fieldId] = customField.value;
                                    }
                                }
                            }
                            responseData = await GenericFunctions_1.salesforceApiRequest.call(this, 'PATCH', `/sobjects/case/${caseId}`, body);
                        }
                        if (operation === 'get') {
                            const caseId = this.getNodeParameter('caseId', i);
                            responseData = await GenericFunctions_1.salesforceApiRequest.call(this, 'GET', `/sobjects/case/${caseId}`);
                        }
                        if (operation === 'getAll') {
                            const returnAll = this.getNodeParameter('returnAll', i);
                            const options = this.getNodeParameter('options', i);
                            try {
                                if (returnAll) {
                                    qs.q = (0, GenericFunctions_1.getQuery)(options, 'Case', returnAll);
                                    responseData = await GenericFunctions_1.salesforceApiRequestAllItems.call(this, 'records', 'GET', '/query', {}, qs);
                                }
                                else {
                                    const limit = this.getNodeParameter('limit', i);
                                    qs.q = (0, GenericFunctions_1.getQuery)(options, 'Case', returnAll, limit);
                                    responseData = await GenericFunctions_1.salesforceApiRequestAllItems.call(this, 'records', 'GET', '/query', {}, qs);
                                }
                            }
                            catch (error) {
                                throw new n8n_workflow_1.NodeApiError(this.getNode(), error);
                            }
                        }
                        if (operation === 'delete') {
                            const caseId = this.getNodeParameter('caseId', i);
                            try {
                                responseData = await GenericFunctions_1.salesforceApiRequest.call(this, 'DELETE', `/sobjects/case/${caseId}`);
                            }
                            catch (error) {
                                throw new n8n_workflow_1.NodeApiError(this.getNode(), error);
                            }
                        }
                        if (operation === 'getSummary') {
                            responseData = await GenericFunctions_1.salesforceApiRequest.call(this, 'GET', '/sobjects/case');
                        }
                        if (operation === 'addComment') {
                            const caseId = this.getNodeParameter('caseId', i);
                            const options = this.getNodeParameter('options', i);
                            const body = {
                                ParentId: caseId,
                            };
                            if (options.commentBody !== undefined) {
                                body.CommentBody = options.commentBody;
                            }
                            if (options.isPublished !== undefined) {
                                body.IsPublished = options.isPublished;
                            }
                            responseData = await GenericFunctions_1.salesforceApiRequest.call(this, 'POST', '/sobjects/casecomment', body);
                        }
                    }
                    if (resource === 'task') {
                        if (operation === 'create') {
                            const additionalFields = this.getNodeParameter('additionalFields', i);
                            const status = this.getNodeParameter('status', i);
                            const body = {
                                Status: status,
                            };
                            if (additionalFields.type !== undefined) {
                                body.TaskSubtype = additionalFields.type;
                            }
                            if (additionalFields.whoId !== undefined) {
                                body.WhoId = additionalFields.whoId;
                            }
                            if (additionalFields.whatId !== undefined) {
                                body.WhatId = additionalFields.whatId;
                            }
                            if (additionalFields.owner !== undefined) {
                                body.OwnerId = additionalFields.owner;
                            }
                            if (additionalFields.subject !== undefined) {
                                body.Subject = additionalFields.subject;
                            }
                            if (additionalFields.callType !== undefined) {
                                body.CallType = additionalFields.callType;
                            }
                            if (additionalFields.priority !== undefined) {
                                body.Priority = additionalFields.priority;
                            }
                            if (additionalFields.callObject !== undefined) {
                                body.CallObject = additionalFields.callObject;
                            }
                            if (additionalFields.description !== undefined) {
                                body.Description = additionalFields.description;
                            }
                            if (additionalFields.activityDate !== undefined) {
                                body.ActivityDate = additionalFields.activityDate;
                            }
                            if (additionalFields.isReminderSet !== undefined) {
                                body.IsReminderSet = additionalFields.isReminderSet;
                            }
                            if (additionalFields.recurrenceType !== undefined) {
                                body.RecurrenceType = additionalFields.recurrenceType;
                            }
                            if (additionalFields.callDisposition !== undefined) {
                                body.CallDisposition = additionalFields.callDisposition;
                            }
                            if (additionalFields.reminderDateTime !== undefined) {
                                body.ReminderDateTime = additionalFields.reminderDateTime;
                            }
                            if (additionalFields.recurrenceInstance !== undefined) {
                                body.RecurrenceInstance = additionalFields.recurrenceInstance;
                            }
                            if (additionalFields.recurrenceInterval !== undefined) {
                                body.RecurrenceInterval = additionalFields.recurrenceInterval;
                            }
                            if (additionalFields.recurrenceDayOfMonth !== undefined) {
                                body.RecurrenceDayOfMonth = additionalFields.recurrenceDayOfMonth;
                            }
                            if (additionalFields.callDurationInSeconds !== undefined) {
                                body.CallDurationInSeconds = additionalFields.callDurationInSeconds;
                            }
                            if (additionalFields.recurrenceEndDateOnly !== undefined) {
                                body.RecurrenceEndDateOnly = additionalFields.recurrenceEndDateOnly;
                            }
                            if (additionalFields.recurrenceMonthOfYear !== undefined) {
                                body.RecurrenceMonthOfYear = additionalFields.recurrenceMonthOfYear;
                            }
                            if (additionalFields.recurrenceDayOfWeekMask !== undefined) {
                                body.RecurrenceDayOfWeekMask = additionalFields.recurrenceDayOfWeekMask;
                            }
                            if (additionalFields.recurrenceStartDateOnly !== undefined) {
                                body.RecurrenceStartDateOnly = additionalFields.recurrenceStartDateOnly;
                            }
                            if (additionalFields.recurrenceTimeZoneSidKey !== undefined) {
                                body.RecurrenceTimeZoneSidKey = additionalFields.recurrenceTimeZoneSidKey;
                            }
                            if (additionalFields.recurrenceRegeneratedType !== undefined) {
                                body.RecurrenceRegeneratedType = additionalFields.recurrenceRegeneratedType;
                            }
                            if (additionalFields.customFieldsUi) {
                                const customFields = additionalFields.customFieldsUi
                                    .customFieldsValues;
                                if (customFields) {
                                    for (const customField of customFields) {
                                        body[customField.fieldId] = customField.value;
                                    }
                                }
                            }
                            responseData = await GenericFunctions_1.salesforceApiRequest.call(this, 'POST', '/sobjects/task', body);
                        }
                        if (operation === 'update') {
                            const taskId = this.getNodeParameter('taskId', i);
                            const updateFields = this.getNodeParameter('updateFields', i);
                            const body = {};
                            if (updateFields.type !== undefined) {
                                body.TaskSubtype = updateFields.type;
                            }
                            if (updateFields.whoId !== undefined) {
                                body.WhoId = updateFields.whoId;
                            }
                            if (updateFields.status !== undefined) {
                                body.Status = updateFields.status;
                            }
                            if (updateFields.whatId !== undefined) {
                                body.WhatId = updateFields.whatId;
                            }
                            if (updateFields.owner !== undefined) {
                                body.OwnerId = updateFields.owner;
                            }
                            if (updateFields.subject !== undefined) {
                                body.Subject = updateFields.subject;
                            }
                            if (updateFields.callType !== undefined) {
                                body.CallType = updateFields.callType;
                            }
                            if (updateFields.priority !== undefined) {
                                body.Priority = updateFields.priority;
                            }
                            if (updateFields.callObject !== undefined) {
                                body.CallObject = updateFields.callObject;
                            }
                            if (updateFields.description !== undefined) {
                                body.Description = updateFields.description;
                            }
                            if (updateFields.activityDate !== undefined) {
                                body.ActivityDate = updateFields.activityDate;
                            }
                            if (updateFields.isReminderSet !== undefined) {
                                body.IsReminderSet = updateFields.isReminderSet;
                            }
                            if (updateFields.recurrenceType !== undefined) {
                                body.RecurrenceType = updateFields.recurrenceType;
                            }
                            if (updateFields.callDisposition !== undefined) {
                                body.CallDisposition = updateFields.callDisposition;
                            }
                            if (updateFields.reminderDateTime !== undefined) {
                                body.ReminderDateTime = updateFields.reminderDateTime;
                            }
                            if (updateFields.recurrenceInstance !== undefined) {
                                body.RecurrenceInstance = updateFields.recurrenceInstance;
                            }
                            if (updateFields.recurrenceInterval !== undefined) {
                                body.RecurrenceInterval = updateFields.recurrenceInterval;
                            }
                            if (updateFields.recurrenceDayOfMonth !== undefined) {
                                body.RecurrenceDayOfMonth = updateFields.recurrenceDayOfMonth;
                            }
                            if (updateFields.callDurationInSeconds !== undefined) {
                                body.CallDurationInSeconds = updateFields.callDurationInSeconds;
                            }
                            if (updateFields.recurrenceEndDateOnly !== undefined) {
                                body.RecurrenceEndDateOnly = updateFields.recurrenceEndDateOnly;
                            }
                            if (updateFields.recurrenceMonthOfYear !== undefined) {
                                body.RecurrenceMonthOfYear = updateFields.recurrenceMonthOfYear;
                            }
                            if (updateFields.recurrenceDayOfWeekMask !== undefined) {
                                body.RecurrenceDayOfWeekMask = updateFields.recurrenceDayOfWeekMask;
                            }
                            if (updateFields.recurrenceStartDateOnly !== undefined) {
                                body.RecurrenceStartDateOnly = updateFields.recurrenceStartDateOnly;
                            }
                            if (updateFields.recurrenceTimeZoneSidKey !== undefined) {
                                body.RecurrenceTimeZoneSidKey = updateFields.recurrenceTimeZoneSidKey;
                            }
                            if (updateFields.recurrenceRegeneratedType !== undefined) {
                                body.RecurrenceRegeneratedType = updateFields.recurrenceRegeneratedType;
                            }
                            if (updateFields.customFieldsUi) {
                                const customFields = updateFields.customFieldsUi
                                    .customFieldsValues;
                                if (customFields) {
                                    for (const customField of customFields) {
                                        body[customField.fieldId] = customField.value;
                                    }
                                }
                            }
                            responseData = await GenericFunctions_1.salesforceApiRequest.call(this, 'PATCH', `/sobjects/task/${taskId}`, body);
                        }
                        if (operation === 'get') {
                            const taskId = this.getNodeParameter('taskId', i);
                            responseData = await GenericFunctions_1.salesforceApiRequest.call(this, 'GET', `/sobjects/task/${taskId}`);
                        }
                        if (operation === 'getAll') {
                            const returnAll = this.getNodeParameter('returnAll', i);
                            const options = this.getNodeParameter('options', i);
                            try {
                                if (returnAll) {
                                    qs.q = (0, GenericFunctions_1.getQuery)(options, 'Task', returnAll);
                                    responseData = await GenericFunctions_1.salesforceApiRequestAllItems.call(this, 'records', 'GET', '/query', {}, qs);
                                }
                                else {
                                    const limit = this.getNodeParameter('limit', i);
                                    qs.q = (0, GenericFunctions_1.getQuery)(options, 'Task', returnAll, limit);
                                    responseData = await GenericFunctions_1.salesforceApiRequestAllItems.call(this, 'records', 'GET', '/query', {}, qs);
                                }
                            }
                            catch (error) {
                                throw new n8n_workflow_1.NodeApiError(this.getNode(), error);
                            }
                        }
                        if (operation === 'delete') {
                            const taskId = this.getNodeParameter('taskId', i);
                            try {
                                responseData = await GenericFunctions_1.salesforceApiRequest.call(this, 'DELETE', `/sobjects/task/${taskId}`);
                            }
                            catch (error) {
                                throw new n8n_workflow_1.NodeApiError(this.getNode(), error);
                            }
                        }
                        if (operation === 'getSummary') {
                            responseData = await GenericFunctions_1.salesforceApiRequest.call(this, 'GET', '/sobjects/task');
                        }
                    }
                    if (resource === 'attachment') {
                        if (operation === 'create') {
                            const name = this.getNodeParameter('name', i);
                            const parentId = this.getNodeParameter('parentId', i);
                            const additionalFields = this.getNodeParameter('additionalFields', i);
                            const binaryPropertyName = this.getNodeParameter('binaryPropertyName', i);
                            const body = {
                                Name: name,
                                ParentId: parentId,
                            };
                            if ((_a = items[i].binary) === null || _a === void 0 ? void 0 : _a[binaryPropertyName]) {
                                body.Body = items[i].binary[binaryPropertyName].data;
                                body.ContentType = items[i].binary[binaryPropertyName].mimeType;
                            }
                            else {
                                throw new n8n_workflow_1.NodeOperationError(this.getNode(), `The property ${binaryPropertyName} does not exist`, { itemIndex: i });
                            }
                            if (additionalFields.description !== undefined) {
                                body.Description = additionalFields.description;
                            }
                            if (additionalFields.owner !== undefined) {
                                body.OwnerId = additionalFields.owner;
                            }
                            if (additionalFields.isPrivate !== undefined) {
                                body.IsPrivate = additionalFields.isPrivate;
                            }
                            responseData = await GenericFunctions_1.salesforceApiRequest.call(this, 'POST', '/sobjects/attachment', body);
                        }
                        if (operation === 'update') {
                            const attachmentId = this.getNodeParameter('attachmentId', i);
                            const updateFields = this.getNodeParameter('updateFields', i);
                            const body = {};
                            if (updateFields.binaryPropertyName !== undefined) {
                                const binaryPropertyName = updateFields.binaryPropertyName;
                                if ((_b = items[i].binary) === null || _b === void 0 ? void 0 : _b[binaryPropertyName]) {
                                    body.Body = items[i].binary[binaryPropertyName].data;
                                    body.ContentType = items[i].binary[binaryPropertyName].mimeType;
                                }
                                else {
                                    throw new n8n_workflow_1.NodeOperationError(this.getNode(), `The property ${binaryPropertyName} does not exist`, { itemIndex: i });
                                }
                            }
                            if (updateFields.name !== undefined) {
                                body.Name = updateFields.name;
                            }
                            if (updateFields.description !== undefined) {
                                body.Description = updateFields.description;
                            }
                            if (updateFields.owner !== undefined) {
                                body.OwnerId = updateFields.owner;
                            }
                            if (updateFields.isPrivate !== undefined) {
                                body.IsPrivate = updateFields.isPrivate;
                            }
                            responseData = await GenericFunctions_1.salesforceApiRequest.call(this, 'PATCH', `/sobjects/attachment/${attachmentId}`, body);
                        }
                        if (operation === 'get') {
                            const attachmentId = this.getNodeParameter('attachmentId', i);
                            responseData = await GenericFunctions_1.salesforceApiRequest.call(this, 'GET', `/sobjects/attachment/${attachmentId}`);
                        }
                        if (operation === 'getAll') {
                            const returnAll = this.getNodeParameter('returnAll', i);
                            const options = this.getNodeParameter('options', i);
                            try {
                                if (returnAll) {
                                    qs.q = (0, GenericFunctions_1.getQuery)(options, 'Attachment', returnAll);
                                    responseData = await GenericFunctions_1.salesforceApiRequestAllItems.call(this, 'records', 'GET', '/query', {}, qs);
                                }
                                else {
                                    const limit = this.getNodeParameter('limit', i);
                                    qs.q = (0, GenericFunctions_1.getQuery)(options, 'Attachment', returnAll, limit);
                                    responseData = await GenericFunctions_1.salesforceApiRequestAllItems.call(this, 'records', 'GET', '/query', {}, qs);
                                }
                            }
                            catch (error) {
                                throw new n8n_workflow_1.NodeApiError(this.getNode(), error);
                            }
                        }
                        if (operation === 'delete') {
                            const attachmentId = this.getNodeParameter('attachmentId', i);
                            try {
                                responseData = await GenericFunctions_1.salesforceApiRequest.call(this, 'DELETE', `/sobjects/attachment/${attachmentId}`);
                            }
                            catch (error) {
                                throw new n8n_workflow_1.NodeApiError(this.getNode(), error);
                            }
                        }
                        if (operation === 'getSummary') {
                            responseData = await GenericFunctions_1.salesforceApiRequest.call(this, 'GET', '/sobjects/attachment');
                        }
                    }
                    if (resource === 'user') {
                        if (operation === 'get') {
                            const userId = this.getNodeParameter('userId', i);
                            responseData = await GenericFunctions_1.salesforceApiRequest.call(this, 'GET', `/sobjects/user/${userId}`);
                        }
                        if (operation === 'getAll') {
                            const returnAll = this.getNodeParameter('returnAll', i);
                            const options = this.getNodeParameter('options', i);
                            try {
                                if (returnAll) {
                                    qs.q = (0, GenericFunctions_1.getQuery)(options, 'User', returnAll);
                                    responseData = await GenericFunctions_1.salesforceApiRequestAllItems.call(this, 'records', 'GET', '/query', {}, qs);
                                }
                                else {
                                    const limit = this.getNodeParameter('limit', i);
                                    qs.q = (0, GenericFunctions_1.getQuery)(options, 'User', returnAll, limit);
                                    responseData = await GenericFunctions_1.salesforceApiRequestAllItems.call(this, 'records', 'GET', '/query', {}, qs);
                                }
                            }
                            catch (error) {
                                throw new n8n_workflow_1.NodeApiError(this.getNode(), error);
                            }
                        }
                    }
                    if (resource === 'flow') {
                        if (operation === 'invoke') {
                            const apiName = this.getNodeParameter('apiName', i);
                            const jsonParameters = this.getNodeParameter('jsonParameters', i);
                            let variables = {};
                            if (jsonParameters) {
                                variables = this.getNodeParameter('variablesJson', i);
                            }
                            else {
                                const setInputVariable = this.getNodeParameter('variablesUi', i, {});
                                if (setInputVariable.variablesValues !== undefined) {
                                    for (const inputVariableData of setInputVariable.variablesValues) {
                                        variables[inputVariableData.name] = inputVariableData.value;
                                    }
                                }
                            }
                            const body = {
                                inputs: [variables],
                            };
                            responseData = await GenericFunctions_1.salesforceApiRequest.call(this, 'POST', `/actions/custom/flow/${apiName}`, body);
                        }
                        if (operation === 'getAll') {
                            const returnAll = this.getNodeParameter('returnAll', i);
                            responseData = await GenericFunctions_1.salesforceApiRequest.call(this, 'GET', '/actions/custom/flow');
                            responseData = responseData.actions;
                            if (!returnAll) {
                                const limit = this.getNodeParameter('limit', i);
                                responseData = responseData.splice(0, limit);
                            }
                        }
                    }
                    if (resource === 'search') {
                        if (operation === 'query') {
                            qs.q = this.getNodeParameter('query', i);
                            responseData = await GenericFunctions_1.salesforceApiRequestAllItems.call(this, 'records', 'GET', '/query', {}, qs);
                        }
                    }
                    if (!Array.isArray(responseData) && responseData === undefined) {
                        responseData = {
                            errors: [],
                            success: true,
                        };
                    }
                    const executionData = this.helpers.constructExecutionMetaData(this.helpers.returnJsonArray(responseData), { itemData: { item: i } });
                    returnData.push(...executionData);
                }
                catch (error) {
                    if (this.continueOnFail()) {
                        const executionErrorData = this.helpers.constructExecutionMetaData(this.helpers.returnJsonArray({ error: error.message }), { itemData: { item: i } });
                        returnData.push(...executionErrorData);
                        continue;
                    }
                    throw error;
                }
            }
        }
        return [returnData];
    }
}
exports.Salesforce = Salesforce;
//# sourceMappingURL=Salesforce.node.js.map
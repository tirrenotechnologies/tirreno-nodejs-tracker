import log from './helpers/Logger.js';

export default class Event {
    static EVENT_TYPES = {
        PAGE_VIEW: 'page_view',
        PAGE_EDIT: 'page_edit',
        PAGE_DELETE: 'page_delete',
        PAGE_SEARCH: 'page_search',
        ACCOUNT_LOGIN: 'account_login',
        ACCOUNT_LOGOUT: 'account_logout',
        ACCOUNT_LOGIN_FAIL: 'account_login_fail',
        ACCOUNT_REGISTRATION: 'account_registration',
        ACCOUNT_EMAIL_CHANGE: 'account_email_change',
        ACCOUNT_PASSWORD_CHANGE: 'account_password_change',
        ACCOUNT_EDIT: 'account_edit',
        PAGE_ERROR: 'page_error',
        FIELD_EDIT: 'field_edit',
    };

    static REQUIRED_FIELDS = {
        userName: (e) => e.#userName,
        eventTime: (e) => e.#eventTime,
        ipAddress: (e) => e.#ipAddress,
        userAgent: (e) => e.#userAgent,
        browserLanguage: (e) => e.#browserLanguage,
        httpMethod: (e) => e.#httpMethod,
        httpReferer: (e) => e.#httpReferer,
        url: (e) => e.#url,
    };

    static OPTIONAL_FIELDS = {
        pageTitle: (e) => e.#pageTitle,
        fullName: (e) => e.#fullName,
        firstName: (e) => e.#firstName,
        lastName: (e) => e.#lastName,
        emailAddress: (e) => e.#emailAddress,
        phoneNumber: (e) => e.#phoneNumber,
        eventType: (e) => e.#eventType,
        httpCode: (e) => e.#httpCode,
        userCreated: (e) => e.#userCreated,
        payload: (e) => e.#payload,
        fieldHistory: (e) => e.#fieldHistory
    };

    #uuid;

    #userName = null;
    #ipAddress = null;
    #url = null;
    #userAgent = null;
    #browserLanguage = null;
    #httpMethod = null;
    #httpReferer = null;
    #eventTime = null;

    #eventType = null;

    #pageTitle = null;
    #fullName = null;
    #firstName = null;
    #lastName = null;
    #emailAddress = null;
    #phoneNumber = null;
    #userCreated = null;

    #httpCode = null;

    #payload = null;
    #fieldHistory = [];

    constructor(uuid) {
        this.#uuid = uuid;

        this.setEventTimeNow();
        this.setEventTypePageView();
    }

    getUuid() {
        return this.#uuid;
    }

    setUserName(value) {
        this.#userName = value;
        return this;
    }
    setIpAddress(value) {
        this.#ipAddress = value;
        return this;
    }
    setUrl(value) {
        this.#url = value;
        return this;
    }
    setUserAgent(value) {
        this.#userAgent = value;
        return this;
    }
    setBrowserLanguage(value) {
        this.#browserLanguage = value;
        return this;
    }
    setHttpMethod(value) {
        this.#httpMethod = value;
        return this;
    }
    setHttpReferer(value) {
        this.#httpReferer = value;
        return this;
    }
    setHttpCode(value) {
        this.#httpCode = value;
        return this;
    }

    setFirstName(value) {
        this.#firstName = value;
        return this;
    }
    setLastName(value) {
        this.#lastName = value;
        return this;
    }
    setFullName(value) {
        this.#fullName = value;
        return this;
    }
    setEmailAddress(value) {
        this.#emailAddress = value;
        return this;
    }
    setPhoneNumber(value) {
        this.#phoneNumber = value;
        return this;
    }
    setUserCreated(value) {
        this.#userCreated = value;
        return this;
    }

    setPageTitle(value) {
        this.#pageTitle = value;
        return this;
    }

    setPayload(value) {
        this.#payload = value;
        return this;
    }

    addFieldHistory(fieldId, value, fieldName = null, oldValue = null, parentId = null, parentName = null) {
        const entry = {
            'field_id': fieldId,
            'new_value': value
        };

        if (fieldName !== null && fieldName !== undefined) {
            entry.field_name = fieldName;
        }

        if (oldValue !== null && oldValue !== undefined) {
            entry.old_value = oldValue;
        }

        if (parentId !== null && parentId !== undefined) {
            entry.parent_id = parentId;
        }

        if (parentName !== null && parentName !== undefined) {
            entry.parent_name = parentName;
        }

        this.#fieldHistory.push(entry);

        return this;
    }

    setEventType(value) {
        this.#eventType = value;
        return this;
    }

    setEventTypePageView() {
        this.#eventType = Event.EVENT_TYPES.PAGE_VIEW;
        return this;
    }
    setEventTypePageEdit() {
        this.#eventType = Event.EVENT_TYPES.PAGE_EDIT;
        return this;
    }
    setEventTypePageDelete() {
        this.#eventType = Event.EVENT_TYPES.PAGE_DELETE;
        return this;
    }
    setEventTypePageSearch() {
        this.#eventType = Event.EVENT_TYPES.PAGE_SEARCH;
        return this;
    }
    setEventTypeAccountLogin() {
        this.#eventType = Event.EVENT_TYPES.ACCOUNT_LOGIN;
        return this;
    }
    setEventTypeAccountLogout() {
        this.#eventType = Event.EVENT_TYPES.ACCOUNT_LOGOUT;
        return this;
    }
    setEventTypeAccountLoginFail() {
        this.#eventType = Event.EVENT_TYPES.ACCOUNT_LOGIN_FAIL;
        return this;
    }
    setEventTypeAccountRegistration() {
        this.#eventType = Event.EVENT_TYPES.ACCOUNT_REGISTRATION;
        return this;
    }
    setEventTypeAccountEmailChange() {
        this.#eventType = Event.EVENT_TYPES.ACCOUNT_EMAIL_CHANGE;
        return this;
    }
    setEventTypeAccountPasswordChange() {
        this.#eventType = Event.EVENT_TYPES.ACCOUNT_PASSWORD_CHANGE;
        return this;
    }
    setEventTypeAccountEdit() {
        this.#eventType = Event.EVENT_TYPES.ACCOUNT_EDIT;
        return this;
    }
    setEventTypePageError() {
        this.#eventType = Event.EVENT_TYPES.PAGE_ERROR;
        return this;
    }
    setEventTypeFieldEdit() {
        this.#eventType = Event.EVENT_TYPES.FIELD_EDIT;
        return this;
    }

    setEventTime(value) {
        this.#eventTime = value;
        return this;
    }

    setEventTimeNow() {
        const d = new Date();
        const iso = d.toISOString();
        const parts = iso.split('T');
        const date = parts[0];
        const time = parts[1].replace('Z', '');
        this.#eventTime = `${date} ${time}`;
        
        return this;
    }

    dump() {
        const result = {};
        const missing = [];

        for (const [key, getter] of Object.entries(Event.REQUIRED_FIELDS)) {
            const value = getter(this);

            if (value === null || value === undefined) {
                result[key] = '';
                missing.push(key);
                continue;
            }

            result[key] = value;
        }

        for (const [key, getter] of Object.entries(Event.OPTIONAL_FIELDS)) {
            const value = getter(this);

            if (value === null || value === undefined) {
                continue;
            }

            result[key] = value;
        }

        if (missing.length > 0) {
            log.debug('Required fields were empty (filled with ""):', missing);
        }

        return result;
    }
}

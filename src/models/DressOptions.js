module.exports = class DressOptions {
    constructor(options = {}) {
        this._categoryId = options.categoryId ?? null;
        this._sex = options.sex ?? 0;
        this._currency = options.currency ?? 0;
        this._hideClanDresses = options.hideClanDresses ?? false;
        this._hideFreeDresses = options.hideFreeDresses ?? false;
        this._ownerFilter = options.ownerFilter ?? [];
        this._ownerType = options.ownerType ?? 0;
        this._usingFilter = options.usingFilter ?? [];
    }

    // Owner Types
    // 1 - STRICT: Strictly filters dresses from the ownerFilter array (No other dresses will be filtered regardless of the options)
    // 2 - TAG_ITEM: Tags dresses from the ownerFilter array with the 'hasPurchases' property set to 1

    get categoryId() {
        return this._categoryId;
    }
    set categoryId(value) {
        this._categoryId = value;
    }

    get sex() {
        return this._sex;
    }
    set sex(value) {
        this._sex = value;
    }

    get currency() {
        return this._currency;
    }
    set currency(value) {
        this._currency = value;
    }

    get hideClanDresses() {
        return this._hideClanDresses;
    }
    set hideClanDresses(value) {
        this._hideClanDresses = value;
    }

    get hideFreeDresses() {
        return this._hideFreeDresses;
    }
    set hideFreeDresses(value) {
        this._hideFreeDresses = value;
    }

    get ownerFilter() {
        return this._ownerFilter;
    }
    set ownerFilter(value) {
        this._ownerFilter = Array.isArray(value) ? value : [];
    }

    get ownerType() {
        return this._ownerType;
    }
    set ownerType(value) {
        this._ownerType = value;
    }

    get usingFilter() {
        return this._usingFilter;
    }
    set usingFilter(value) {
        this._usingFilter = Array.isArray(value) ? value : [];
    }
}

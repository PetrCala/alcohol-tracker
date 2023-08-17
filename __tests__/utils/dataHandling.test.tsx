import { dateToDateObject, getNextMonth, getPreviousMonth, timestampToDate } from "../../src/utils/dataHandling";

describe('data handling functions', () => {
    
    it('correctly converts date to DateObject', () => {
        let dateNow = new Date();
        let dateObject = dateToDateObject(dateNow);
        let dateFromDateObject = timestampToDate(dateObject.timestamp);

        expect(dateFromDateObject).toEqual(dateNow);
    });
    
    it ('subtracts one month on calling getPreviousMonth', () => {
        let dateNow = new Date();
        let dateObject = dateToDateObject(dateNow);
        let datePreviousMonth = getPreviousMonth(dateObject);

        let monthNow = dateNow.getMonth() + 1; // 0-indexed
        let monthPrevious = datePreviousMonth.month; // 1-indexed

        expect(monthNow).toEqual(monthPrevious + 1);
    });

    it('adds one month on calling getNextMonth', () => {
        let dateNow = new Date();
        let dateObject = dateToDateObject(dateNow);
        let dateNextMonth = getNextMonth(dateObject);

        let monthNow = dateNow.getMonth() + 1; // 0-indexed
        let monthNext = dateNextMonth.month;  // 1-indexed

        expect(monthNow).toEqual(monthNext - 1);
    });
});
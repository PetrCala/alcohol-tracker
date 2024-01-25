import { DatabaseProps } from "@src/types/database";
import { getUserOverallConsumption } from "../source/consumption";
import { KirokuReport } from "./reportTypes";

// Function to generate a report
// TODO
// Example usage
// const myReport = generateReport();
// console.log(myReport);
export function generateReport(db: DatabaseProps): KirokuReport {
    const report: KirokuReport = {
        sections: [
            {
                title: "Users Overview",
                items: [
                    {
                        heading: "Users in Database",
                        description: "Number of total users in the database",
                        value: "Value 1"
                    },
                    {
                        heading: "Active users",
                        description: "Number of users that recorded at least one session in the last month",
                        value: 42
                    }
                ]
            },
            {
                title: "Sessions Overview",
                items: [
                    {
                        heading: "Total Number of Sessions",
                        description: "Total number of sessions recorded in the database",
                        value: "Value 3"
                    }
                ]
            }
            // More sections can be added here
        ]
    };
    return report;
}
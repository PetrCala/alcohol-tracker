// Define the structure of each report item
type KirokuReportItem = {
    heading: string;
    description: string;
    value: string | number;
};
// Define the structure of each report section
type KirokuReportSection = {
    title: string;
    items: KirokuReportItem[];
};
// Define the structure of the report
export type KirokuReport = {
    sections: KirokuReportSection[];
};

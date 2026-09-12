export type ResolutionStatus = "Pending" | "Resolved";

export type ClientReport = {
  id: string;
  clientName: string;
  orderId: string;
  issueType: string;
  description: string;
  response: string;
  status: ResolutionStatus;
};

export const reports: ClientReport[] = [
  {
    id: "4011",
    clientName: "Ali",
    orderId: "#4011",
    issueType: "Late Delivery",
    description:
      "The delivery arrived over an hour after the scheduled delivery window. The client requested an update during the delay but did not receive one.",
    response: "Refund Issued",
    status: "Resolved",
  },
  {
    id: "4015",
    clientName: "Ahmed",
    orderId: "#4015",
    issueType: "Wrong Item",
    description:
      "The client received an item different from the one requested. A replacement was arranged after the report was reviewed.",
    response: "Replacement Sent",
    status: "Resolved",
  },
  {
    id: "4018",
    clientName: "Sara",
    orderId: "#4018",
    issueType: "No Response",
    description:
      "The client reported that the assigned rider did not respond to delivery instructions or follow-up calls.",
    response: "Pending Review",
    status: "Pending",
  },
];

export function getReportById(id: string) {
  return reports.find((report) => report.id === id);
}

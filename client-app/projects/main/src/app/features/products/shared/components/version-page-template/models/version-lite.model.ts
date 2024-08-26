export class BaseVersionLite {
  id: string;
  ticketId: string;
  label: string;
  branchedFromVersionId: string;
  synchedWithVersionId: string;
  deleted: boolean;
  isPublished: boolean;
  publishedBy!: { id: string, fullName: string };
  publishedOn!: Date;
  isLatestReleased: boolean;

  constructor(id: string, label: string, ticketId: string, branchedFromVersionId = '00000000-0000-0000-0000-000000000000') {
    this.id = id;
    this.label = label;
    this.ticketId = ticketId;
    this.branchedFromVersionId = branchedFromVersionId;
    this.synchedWithVersionId = this.branchedFromVersionId;
    this.deleted = false;
    this.isPublished = false;
    this.isLatestReleased = false;
  }
}

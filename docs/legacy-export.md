# Moving browser notes from the old origin

Browser storage belongs to an origin. The new deployment cannot read notes from another domain, a file URL, browser profile, or device.

Before replacing the old deployment, open it in the browser/profile containing your notes. Review `scripts/legacy-export.mjs`, then paste its function into that page's developer console. It downloads raw weekly HTML (including embedded screenshots) and progress without changing storage or executing markup. Keep that JSON file privately.

In the new app, sign in, open Settings, choose the legacy export file, preview the account and items, then import. Cloud weekly notes are read from the signed-in account separately. Screenshots referenced by legacy Firestore IDs require that same account's existing images; missing images are reported as failures and no completion marker is written. Originals are never deleted.

If a note is too large for the new model, retain the source export and split it manually before importing. Unsupported markup remains in `sourceHtml`; the editor shows only supported formatting. Failed imports can be retried. A completed source marker prevents overwriting or resurrecting its destination.

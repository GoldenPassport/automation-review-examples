import { Document, Packer, Paragraph } from "docx";
import { writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

/**
 * Generates three .docx files in this folder, one per branch of the triage
 * graph. Run with `pnpm generate-samples`.
 *
 *   clean-claim.docx     → category="claim",   decision="auto-process"
 *   malformed-claim.docx → category="claim",   decision="human-review"
 *   unknown.docx         → category="unknown", decision="reject"
 *
 * Edit the body text below and re-run if you want to test the model on
 * different inputs.
 */

const __dirname = dirname(fileURLToPath(import.meta.url));

type Sample = {
  name: string;
  paragraphs: string[];
};

const samples: Sample[] = [
  {
    name: "clean-claim.docx",
    paragraphs: [
      "Subject: Claim for collision damage",
      "",
      "Dear Claims Team,",
      "",
      "I am writing to file a claim for an incident that occurred on 12/04/2026 under policy POL-554821. My car was rear-ended at the traffic lights on Bristol Road in Solihull. The other driver has provided their insurance details and a police report has been filed (reference WMP-2026-04-7723).",
      "",
      "Damage assessment from the local body shop is attached separately. Estimated repair cost is approximately £3,200. Please contact me at your earliest convenience to discuss next steps.",
      "",
      "Kind regards,",
      "L. Reynolds",
    ],
  },
  {
    name: "malformed-claim.docx",
    paragraphs: [
      "Hi there,",
      "",
      "I want to file a claim. My car was rear-ended yesterday and I need someone to call me back to sort it out. The other driver was at fault and I have his details.",
      "",
      "Please get back to me as soon as possible.",
      "",
      "Thanks,",
      "M. Quinn",
    ],
  },
  {
    name: "unknown.docx",
    paragraphs: [
      "To whom it may concern,",
      "",
      "I am writing to express my interest in any open positions at your company. I have ten years of experience in customer service and would love the chance to interview with your team.",
      "",
      "My CV is attached. Please let me know if you have any roles that might be a fit.",
      "",
      "Best wishes,",
      "A. Patel",
    ],
  },
];

async function run() {
  for (const sample of samples) {
    const doc = new Document({
      sections: [
        {
          children: sample.paragraphs.map((text) => new Paragraph(text)),
        },
      ],
    });
    const buf = await Packer.toBuffer(doc);
    const outPath = join(__dirname, sample.name);
    await writeFile(outPath, buf);
    console.log(`Wrote ${outPath}`);
  }
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});

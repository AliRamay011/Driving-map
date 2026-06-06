import models from "../config/db.js"; // correct path to model
import 'dotenv/config';
const { report: Report } = models; // get the report model

export const ReportPost = async (req, res) => {
  try {
    const r = await Report.create(req.body);
    res.status(201).json(r);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong' });
  }
};

// GET /api/reports
export const ReportGet = async (req, res) => {
  try {
    const reports = await Report.findAll();
    res.json(reports);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong' });
  }
}

'use strict';
const mongoose = require('mongoose');

const issues = {}; // In-memory storage for issues

module.exports = function (app) {

  app.route('/api/issues/:project')

    // GET: Retrieve issues with optional filters
    .get(function (req, res) {
      const project = req.params.project;
      const filter = req.query;
      const projectIssues = issues[project] || [];
      const filteredIssues = projectIssues.filter(issue => {
        return Object.keys(filter).every(key => issue[key] == filter[key]);
      });
      res.json(filteredIssues);
    })

    // POST: Create a new issue
    .post(function (req, res) {
      const project = req.params.project;
      const { issue_title, issue_text, created_by, assigned_to, status_text } = req.body;

      if (!issue_title || !issue_text || !created_by) {
        return res.json({ error: 'required field(s) missing' });
      }

      const newIssue = {
        _id: Date.now().toString(),
        issue_title,
        issue_text,
        created_by,
        assigned_to: assigned_to || '',
        status_text: status_text || '',
        created_on: new Date(),
        updated_on: new Date(),
        open: true
      };

      if (!issues[project]) issues[project] = [];
      issues[project].push(newIssue);
      res.json(newIssue);
    })

    // PUT: Update an existing issue
    .put(function (req, res) {
      const project = req.params.project;
      const { _id, issue_title, issue_text, created_by, assigned_to, status_text, open } = req.body;

      if (!_id) {
        return res.json({ error: 'missing _id' });
      }

      if (!issue_title && !issue_text && !created_by && !assigned_to && !status_text && open == null) {
        return res.json({ error: 'no update field(s) sent', '_id': _id });
      }

      const projectIssues = issues[project] || [];
      const issue = projectIssues.find(issue => issue._id === _id);

      if (!issue) {
        return res.json({ error: 'could not update', '_id': _id });
      }

      if (issue_title) issue.issue_title = issue_title;
      if (issue_text) issue.issue_text = issue_text;
      if (created_by) issue.created_by = created_by;
      if (assigned_to) issue.assigned_to = assigned_to;
      if (status_text) issue.status_text = status_text;
      if (open !== undefined) issue.open = open;

      issue.updated_on = new Date();

      res.json({ result: 'successfully updated', '_id': _id });
    })

    // DELETE: Delete an issue
    .delete(function (req, res) {
      const project = req.params.project;
      const { _id } = req.body;

      if (!_id) {
        return res.json({ error: 'missing _id' });
      }

      const projectIssues = issues[project] || [];
      const issueIndex = projectIssues.findIndex(issue => issue._id === _id);

      if (issueIndex === -1) {
        return res.json({ error: 'could not delete', '_id': _id });
      }

      projectIssues.splice(issueIndex, 1);
      res.json({ result: 'successfully deleted', '_id': _id });
    });

};

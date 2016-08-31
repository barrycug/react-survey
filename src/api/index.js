import  PouchDB from 'pouchdb';
import { v4 } from 'node-uuid';

window.PouchDB = PouchDB;

const db = new PouchDB('survey');

export const createUser = (params) => {
  return db.put({
    ...params,
    _id: params.email
  });
};


export const login = (email, password) => {
  return db.get(email).then(user => {
    let u = {...user};
    delete u['_rev'];

    db.get('session').then(cur => { // update session
      return db.put({
        ...u,
        _id: 'session',
        _rev: cur._rev
      });
    }).catch(() => { // or create new session
      return db.put({
        ...u,
        _id: 'session'
      });
    });

    return Promise.resolve(user);
  });
};

export const fetchCurrentUser = () => {
  return db.get('session');
};

export const fetchUserSurveys = (email) => {
  return db.allDocs({
    include_docs: true,
    startkey: `${email}-survey-`,
    endkey: `${email}-survey-\uffff`
  }).then(res => {
    return Promise.resolve(res.rows.map(row => row.doc));
  });
};

export const createSurvey = (email) => {
  return db.put({
    _id: `${email}-survey-${v4()}`,
    title: "No Title",
    subTitle: 'No Description',
    questions: []
  }).then(res => {
    return db.get(res.id);
  });
};

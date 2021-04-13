import 'source-map-support/register'
import * as admin from "firebase-admin";

type Collection = FirebaseFirestore.CollectionReference<FirebaseFirestore.DocumentData>;
type Document = FirebaseFirestore.DocumentReference<FirebaseFirestore.DocumentData>;
type Root = FirebaseFirestore.Firestore;

function isRoot(obj:any): obj is Root {
  return obj?.constructor?.name == 'Firestore';
}

function isCollection(obj:any): obj is Collection {
  return obj?.constructor?.name == 'CollectionReference';
}

function isDocument(obj:any): obj is Document {
  return obj?.constructor?.name == 'DocumentReference';
}

const asyncMap = async <T, R = any>(fn: (e: T) => Promise<R>, list: T[]):Promise<R[]> => await Promise.all(list.map(fn));

const getChildDocuments = async(parent: FirebaseFirestore.CollectionReference<FirebaseFirestore.DocumentData>):Promise<Document[]> => {
  return await parent.listDocuments();
}

const getChildCollections = async (parent: Document|Root):Promise<Collection[]> => {
  return await parent.listCollections();
}

const traverseCollection = async (collection:Collection, documentPaths:string[] = []) => {
  const documents = await getChildDocuments(collection);
  await asyncMap(async d => traverseDocument(d, documentPaths), documents);
  return documentPaths;
}

const traverseDocument = async (document:Document|Root, documentPaths:string[] = []) => {
  if (isDocument(document)) {
    documentPaths.push(document.path);
  }
  const collections = await getChildCollections(document);
  await asyncMap(async c => traverseCollection(c, documentPaths), collections);
  return documentPaths;
}


const app = admin.initializeApp();
traverseDocument(app.firestore()).then(console.log, console.error);
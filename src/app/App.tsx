import { workspaceLabel } from "../workspaces/model";
const PentestWorkspace = lazy(() => import("../pentest/Workspace"));
import WorkspaceNav from "./WorkspaceNav";
import LibraryHome from "../reference/LibraryHome";
import { lazy, Suspense } from "react";
const LearningHome = lazy(() => import("../oscp/LearningHome"));
const Mindmap = lazy(() => import("../oscp/Mindmap"));
const PracticeTracks = lazy(() => import("../oscp/PracticeTracks"));
const LearningTopics = lazy(() => import("../oscp/Topics"));
const ResourceContext = lazy(() => import("../oscp/ResourceContext"));
import KnowledgeVault from "../notebook/KnowledgeVault";
import OsaiStudyPlan from "../osai/StudyPlan";
import OsaiLibrary from "../osai/Library";
import OsaiReader from "../osai/Reader";
import WorkspaceSwitcher from "../workspaces/WorkspaceSwitcher";
import { workspaceFromPath, workspacePath } from "../workspaces/routes";
import {
  NavLink,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import NotebookView, { NotePage } from "../notebook/NotebookView";
import MachineView from "../notebook/MachineView";
import TrashView from "../notebook/TrashView";
import { NotebookProvider } from "../notebook/NotebookContext";
import { useAccount } from "./useAccount";
import AccountPanel from "./AccountPanel";
import UpdateNotice from "./UpdateNotice";
import DemoEditor from "../editor/DemoEditor";
import CheatSheet from "../reference/CheatSheet";
import WalkthroughLibrary from "../walkthroughs/WalkthroughLibrary";
import WalkthroughReader from "../walkthroughs/WalkthroughReader";
export default function App() {
  const account = useAccount(),
    location = useLocation();
  const uid = account.user?.uid,
    workspace = workspaceFromPath(location.pathname);
  return (
    <NotebookProvider key={uid || "public"} uid={uid || null}>
      <div className="app">
        <aside
          className={workspace === "oscp" ? "sidebar oscp-sidebar" : "sidebar"}
        >
          <NavLink
            className="brand"
            to={workspacePath(workspace, "study-plan")}
          >
            <span className="brand-icon">⌘</span>
            <span>
              FIELDNOTES
              <small>{workspaceLabel(workspace)} STUDY WORKSPACE</small>
            </span>
          </NavLink>
          <WorkspaceSwitcher workspace={workspace} />
          <WorkspaceNav workspace={workspace} />
          <div className="sidebar-foot">
            <span className="dot" /> Personal notebook
            <p>Practice. Document. Repeat.</p>
          </div>
        </aside>
        <main>
          <UpdateNotice />
          <header className="topbar">
            <span>{workspaceLabel(workspace)} / Personal workspace</span>
            <span className="badge">Study edition</span>
          </header>
          {account.error && (
            <p className="status">
              Cloud sync is not configured. Study references and the local demo
              remain available.
            </p>
          )}
          {workspace === "oscp" && (
            <Suspense fallback={null}>
              <ResourceContext uid={uid} />
            </Suspense>
          )}
          <Suspense
            fallback={
              <p className="page" role="status">
                Loading learning workspace…
              </p>
            }
          >
            <Routes>
              <Route
                path="/automated-pentest"
                element={
                  <Navigate replace to="/automated-pentest/study-plan" />
                }
              />
              {(
                [
                  ["study-plan", "today"],
                  ["practice", "practice"],
                  ["library", "library"],
                  ["library/:id", "resource"],
                ] as const
              ).map(([path, page]) => (
                <Route
                  key={path}
                  path={"/automated-pentest/" + path}
                  element={
                    <PentestWorkspace
                      key={location.pathname + (uid || "public")}
                      page={page}
                      uid={uid}
                    />
                  }
                />
              ))}
              <Route
                path="/automated-pentest/notes"
                element={
                  uid ? (
                    <NotebookView
                      key="pentest-notes"
                      uid={uid}
                      workspace="automated-pentest"
                    />
                  ) : (
                    <AccountPanel user={null} />
                  )
                }
              />
              <Route
                path="/automated-pentest/notes/:id"
                element={
                  uid ? (
                    <NotePage
                      key={location.pathname}
                      uid={uid}
                      workspace="automated-pentest"
                    />
                  ) : (
                    <AccountPanel user={null} />
                  )
                }
              />
              <Route
                path="/automated-pentest/trash"
                element={
                  uid ? (
                    <TrashView uid={uid} workspace="automated-pentest" />
                  ) : (
                    <AccountPanel user={null} />
                  )
                }
              />

              <Route
                path="/library"
                element={<LibraryHome workspace="oscp" />}
              />
              <Route
                path="/osai/resources"
                element={<LibraryHome workspace="osai" />}
              />
              <Route
                path="/practice-tracks/:trackId?"
                element={<PracticeTracks key={location.pathname} />}
              />
              <Route
                path="/mindmap"
                element={<Mindmap key={uid || "public"} uid={uid} />}
              />
              <Route
                path="/topics/:topicId"
                element={
                  <LearningTopics
                    key={location.pathname + (uid || "public")}
                    uid={uid}
                  />
                }
              />
              <Route
                path="/knowledge-vault/:id?"
                element={<KnowledgeVault key={uid || "public"} uid={uid} />}
              />
              <Route path="/osai/library" element={<OsaiLibrary />} />
              <Route
                path="/osai/library/:slug"
                element={<OsaiReader key={location.pathname} uid={uid} />}
              />
              <Route
                path="/osai"
                element={<Navigate replace to="/osai/study-plan" />}
              />
              <Route
                path="/osai/study-plan"
                element={<OsaiStudyPlan uid={uid} />}
              />
              <Route
                path="/osai/notes"
                element={
                  uid ? (
                    <NotebookView uid={uid} workspace="osai" />
                  ) : (
                    <AccountPanel user={null} />
                  )
                }
              />
              <Route
                path="/osai/topics"
                element={
                  uid ? (
                    <NotebookView uid={uid} workspace="osai" topics />
                  ) : (
                    <AccountPanel user={null} />
                  )
                }
              />
              <Route
                path="/osai/notes/:id"
                element={
                  uid ? (
                    <NotePage
                      key={location.pathname}
                      uid={uid}
                      workspace="osai"
                    />
                  ) : (
                    <AccountPanel user={null} />
                  )
                }
              />
              <Route
                path="/osai/labs"
                element={
                  uid ? (
                    <MachineView uid={uid} workspace="osai" />
                  ) : (
                    <AccountPanel user={null} />
                  )
                }
              />
              <Route
                path="/osai/trash"
                element={
                  uid ? (
                    <TrashView uid={uid} workspace="osai" />
                  ) : (
                    <AccountPanel user={null} />
                  )
                }
              />
              <Route
                path="/settings"
                element={<AccountPanel user={account.user} />}
              />
              <Route
                path="/notes"
                element={
                  uid ? (
                    <NotebookView
                      uid={uid}
                      topics={
                        new URLSearchParams(location.search).get("view") ===
                        "tags"
                      }
                    />
                  ) : (
                    <AccountPanel user={null} />
                  )
                }
              />
              <Route
                path="/topics"
                element={<LearningTopics key={uid || "public"} uid={uid} />}
              />
              <Route
                path="/notes/:id"
                element={
                  uid ? (
                    <NotePage key={location.pathname} uid={uid} />
                  ) : (
                    <AccountPanel user={null} />
                  )
                }
              />
              <Route
                path="/machines"
                element={
                  uid ? <MachineView uid={uid} /> : <AccountPanel user={null} />
                }
              />
              <Route
                path="/trash"
                element={
                  uid ? <TrashView uid={uid} /> : <AccountPanel user={null} />
                }
              />
              <Route path="/walkthroughs" element={<WalkthroughLibrary />} />
              <Route
                path="/walkthroughs/:id"
                element={<WalkthroughReader key={location.pathname} />}
              />
              <Route path="/demo" element={<DemoEditor />} />
              <Route path="/study-plan" element={<LearningHome uid={uid} />} />
              <Route path="/cheat-sheet" element={<CheatSheet />} />
              <Route path="*" element={<Navigate to="/study-plan" replace />} />
            </Routes>
          </Suspense>
        </main>
      </div>
    </NotebookProvider>
  );
}

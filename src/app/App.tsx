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
import StudyPlan from "../reference/StudyPlan";
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
        <aside className="sidebar">
          <NavLink
            className="brand"
            to={workspacePath(workspace, "study-plan")}
          >
            <span className="brand-icon">⌘</span>
            <span>
              FIELDNOTES<small>{workspace.toUpperCase()} STUDY WORKSPACE</small>
            </span>
          </NavLink>
          <WorkspaceSwitcher workspace={workspace} />
          <p className="nav-label">YOUR WORKSPACE</p>
          <nav>
            {(workspace === "osai"
              ? [
                  ["/osai/study-plan", "Study plan"],
                  ["/osai/library/osai-vault", "OSAI Vault"],
                  ["/osai/library/owasp-resources", "OWASP Resources"],
                  ["/osai/labs", "Labs"],
                  ["/osai/topics", "Topics"],
                  ["/osai/notes", "All notes"],
                  ["/osai/library", "Learning library"],
                  ["/settings", "Settings"],
                ]
              : [
                  ["/study-plan", "Study plan"],
                  ["/knowledge-vault", "Knowledge Vault"],
                  ["/machines", "Machines"],
                  ["/topics", "Topics"],
                  ["/notes", "All notes"],
                  ["/cheat-sheet", "Cheat sheet"],
                  ["/walkthroughs", "Walkthroughs"],
                  ["/settings", "Settings"],
                ]
            ).map(([to, label]) => (
              <NavLink key={to} to={to} end={to === "/osai/library"}>
                {label}
              </NavLink>
            ))}
          </nav>
          <div className="sidebar-foot">
            <span className="dot" /> Personal notebook
            <p>Practice. Document. Repeat.</p>
          </div>
        </aside>
        <main>
          <UpdateNotice />
          <header className="topbar">
            <span>{workspace.toUpperCase()} / Personal workspace</span>
            <span className="badge">Study edition</span>
          </header>
          {account.error && (
            <p className="status">
              Cloud sync is not configured. Study references and the local demo
              remain available.
            </p>
          )}
          <Routes>
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
                uid ? <NotebookView uid={uid} /> : <AccountPanel user={null} />
              }
            />
            <Route
              path="/topics"
              element={
                uid ? (
                  <NotebookView uid={uid} topics />
                ) : (
                  <AccountPanel user={null} />
                )
              }
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
            <Route path="/study-plan" element={<StudyPlan uid={uid} />} />
            <Route path="/cheat-sheet" element={<CheatSheet />} />
            <Route path="*" element={<Navigate to="/study-plan" replace />} />
          </Routes>
        </main>
      </div>
    </NotebookProvider>
  );
}

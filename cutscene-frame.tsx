import { Component, Suspense, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

function Recovery({ failed = false, onContinue }: { failed?: boolean; onContinue(): void }) {
  return <section className="expansion-screen" aria-label="Cutscene recovery">
    <h1 role="status">{failed ? 'The cutscene could not start' : 'Loading cutscene…'}</h1>
    <p>{failed ? 'You can continue without reloading or clearing your saved progress.' : 'On a slow connection, you can skip the cutscene and keep playing.'}</p>
    <button type="button" onClick={onContinue}>CONTINUE WITHOUT CUTSCENE</button>
  </section>;
}

class CutsceneBoundary extends Component<{ children: ReactNode; onContinue(): void }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() {
    return this.state.failed ? <Recovery failed onContinue={this.props.onContinue}/> : this.props.children;
  }
}

/** Keep touch controls at viewport size and contain failed lazy imports/renders. */
export function CutsceneFrame({ children, onContinue }: { children: ReactNode; onContinue(): void }) {
  return createPortal(<section className="cutscene-viewport" aria-label="Dojo cutscene">
    <CutsceneBoundary onContinue={onContinue}>
      <Suspense fallback={<Recovery onContinue={onContinue}/>}>{children}</Suspense>
    </CutsceneBoundary>
  </section>, document.body);
}

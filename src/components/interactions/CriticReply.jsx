import { say } from '../../text'

// CRITIC-REPLY: answer the Critic. Each answer shrinks it one size (never below 1).
export default function CriticReply({ cfg, screen, state, update, advance }) {
  const reply = (o) => {
    update((st) => ({
      critic_size: st.criticReplied[screen.id] ? st.critic_size : Math.max(1, st.critic_size - 1),
      criticReplied: { ...st.criticReplied, [screen.id]: o.id },
      done: { ...st.done, [screen.id]: true },
    }))
    advance(o.goto || cfg.continueTo)
  }
  return (
    <>
      {cfg.explainer && <p className="note">{say(cfg.explainer, state)}</p>}
      <div className="choices">
        {cfg.options.map((o) => (
          <button key={o.id} className={`choice reply ${state.criticReplied[screen.id] === o.id ? 'chosen' : ''}`} onClick={() => reply(o)}>
            {say(o.label, state)}
          </button>
        ))}
      </div>
    </>
  )
}

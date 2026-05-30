import PageHeader from '../components/PageHeader'
import Section from '../components/ui/Section'
import SectionHeading from '../components/ui/SectionHeading'
import Button from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { FAN_CLUBS, CHALLENGES } from '../data/content'
import { SOCIALS } from '../data/socials'
import './pages.css'

export default function Community() {
  return (
    <>
      <PageHeader
        eyebrow="Community"
        title="Find your people"
        subtitle="Join thousands of fans across Discord, WhatsApp and beyond. Discuss, create and compete."
      />

      <Section>
        <Card hover={false} className="board">
          <div>
            <span className="eyebrow">Join the chat</span>
            <h2>Hang out on Discord &amp; WhatsApp</h2>
            <p className="text-muted">Daily discussion, watch parties, event planning and a friendly mod team.</p>
          </div>
          <div style={{ display: 'flex', gap: 'var(--sp-3)', flexWrap: 'wrap' }}>
            {SOCIALS.slice(0, 3).map((s) => (
              <Button key={s.name} href={s.url} variant="ghost">{s.name}</Button>
            ))}
          </div>
        </Card>
      </Section>

      <Section className="section--alt">
        <SectionHeading center eyebrow="Fan Clubs" title="Pick your fandom" />
        <div className="grid grid-3">
          {FAN_CLUBS.map((f) => (
            <Card key={f} className="tile" style={{ textAlign: 'center' }}>
              <h4 style={{ margin: 0 }}>{f}</h4>
            </Card>
          ))}
        </div>
      </Section>

      <Section>
        <SectionHeading center eyebrow="Get Involved" title="Community challenges" />
        <div className="grid grid-2">
          {CHALLENGES.map((c) => (
            <Card hover={false} key={c.title} className="tile">
              <h4>{c.title}</h4>
              <p>{c.text}</p>
            </Card>
          ))}
        </div>
      </Section>
    </>
  )
}

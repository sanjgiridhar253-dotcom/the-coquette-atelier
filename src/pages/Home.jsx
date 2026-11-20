import Hero from '../components/Hero'
import BirthdayCollection from '../components/BirthdayCollection'
import HowItWorks from '../components/HowItWorks'
import RibbonBow from '../components/RibbonBow'
import Contact from '../components/Contact'

function Home() {
  return (
    <>
      <section id="home">
        <Hero />
      </section>
      <div className="atelier-sheet">
        <BirthdayCollection />
        <div className="sheet-divider" aria-hidden="true">
          <RibbonBow className="sheet-divider-bow" />
        </div>
        <HowItWorks />
      </div>
      <Contact />
    </>
  )
}

export default Home

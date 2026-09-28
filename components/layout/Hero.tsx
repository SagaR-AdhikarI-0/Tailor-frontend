import leftModel from '../../src/assets/left .png'
import leftLastModel from '../../src/assets/left_last.png'
import middleModel from '../../src/assets/middle.png'
import rightModel from '../../src/assets/right.png'
import rightLastModel from '../../src/assets/right_last.png'

function FashionHero() {
    return (
        <section className="relative min-h-[680px] overflow-hidden rounded-b-[28px] bg-[#f4efe9] px-4 pt-12 sm:px-6 sm:pt-14">

            {/* Content */}
            <div className="relative z-10 mx-auto max-w-5xl text-center">

                {/* Small pill */}
                <button className="mb-4 rounded-full bg-white px-6 py-1.5 text-xs font-medium text-gray-800 shadow-sm">
                    Discover Fashion
                </button>

                {/* Heading */}
                <h1 className="mx-auto max-w-3xl text-3xl font-medium leading-[1.05] tracking-tight text-stone-900 sm:text-4xl md:text-5xl">
                    Where style meets innovative ways of
                    <br />
                    meeting new fashion
                </h1>

                {/* Subtitle */}
                <p className="mx-auto mt-3 max-w-lg text-xs leading-5 text-stone-600 sm:text-sm">
                    Discover unique styles and explore innovative ways to
                    express yourself through modern fashion.
                </p>
            </div>

            {/* Models */}
            <div className="relative z-10 mx-auto mt-6 flex h-[470px] max-w-[1100px] items-end justify-center gap-1 sm:mt-8 sm:gap-2">

                {/* 1 — leans LEFT */}
                <div
                    className="
      relative
    h-[320px] w-[19%]
      -rotate-[4deg]
      origin-bottom
      overflow-hidden
      rounded-t-[100px]
      rounded-b-[20px]
      bg-[#d9b8b2]
    "
                >
                    <img
                        src={leftModel}
                        alt="Tailored look"
                        className="
        absolute bottom-0 left-1/2
              h-[100%] w-auto
        -translate-x-1/2
        object-contain
      "
                    />
                </div>


                {/* 2 — also leans LEFT, but less */}
                <div
                    className="
      relative
    h-[410px] w-[19%]
      -rotate-[2deg]
      origin-bottom
      overflow-hidden
      rounded-t-[100px]
      rounded-b-[20px]
      bg-[#bdcad5]
    "
                >
                    <img
                        src={leftLastModel}
                        alt="Tailored look"
                        className="
        absolute bottom-0 left-1/2
        h-[106%] w-auto
        -translate-x-1/2
        object-contain
      "
                    />
                </div>


                {/* 3 — STRAIGHT */}
                <div
                    className="
      relative
    h-[470px] w-[20%]
      rotate-0
      origin-bottom
      overflow-hidden
      rounded-t-[110px]
      rounded-b-[20px]
      bg-[#e2d1a8]
    "
                >
                    <img
                        src={middleModel}
                        alt="Tailored look"
                        className="
        absolute bottom-0 left-1/2
        h-[106%] w-auto
        -translate-x-1/2
        object-contain
      "
                    />
                </div>


                {/* 4 — leans RIGHT */}
                <div
                    className="
      relative
    h-[410px] w-[19%]
      rotate-[2deg]
      origin-bottom
      overflow-hidden
      rounded-t-[100px]
      rounded-b-[20px]
      bg-[#b8c8bc]
    "
                >
                    <img
                        src={rightModel}
                        alt="Tailored look"
                        className="
        absolute bottom-0 left-1/2
              h-[106%] w-auto
        -translate-x-1/2
        object-contain
      "
                    />
                </div>


                {/* 5 — also leans RIGHT */}
                <div
                    className="
      relative
    h-[320px] w-[19%]
      rotate-[4deg]
      origin-bottom
      overflow-hidden
      rounded-t-[100px]
      rounded-b-[20px]
      bg-[#c9bfd1]
    "
                >
                    <img
                        src={rightLastModel}
                        alt="Tailored look"
                        className="
        absolute bottom-0 left-1/2
        h-[100%] w-auto
        -translate-x-1/2
        object-contain
      "
                    />
                </div>

            </div>
        </section>
    );
}

export default FashionHero;
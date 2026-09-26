const models = [
    {
        image:
            "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=500&q=80",
        bg: "bg-[#e9e9dc]",
    },
    {
        image:
            "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=500&q=80",
        bg: "bg-[#f0f0f0]",
    },
    {
        image:
            "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=500&q=80",
        bg: "bg-[#f4f4f4]",
    },
    {
        image:
            "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=500&q=80",
        bg: "bg-[#b77d62]",
    },
    {
        image:
            "https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?auto=format&fit=crop&w=500&q=80",
        bg: "bg-[#777b72]",
    },
];

function FashionHero() {
    return (
        <section className="relative min-h-[650px] overflow-hidden rounded-b-[28px] bg-[#62865f] px-6 pt-24">

            {/* Decorative diagonal shape */}
            <div className="pointer-events-none absolute -left-20 top-48 h-[400px] w-[600px] rotate-[25deg] rounded-full bg-[#6f916b] opacity-40" />

            {/* Content */}
            <div className="relative z-10 mx-auto max-w-5xl text-center">

                {/* Small pill */}
                <button className="mb-7 rounded-full bg-white px-7 py-2 text-sm font-medium text-gray-800 shadow-sm">
                    Discover Fashion
                </button>

                {/* Heading */}
                <h1 className="mx-auto max-w-4xl text-4xl font-medium leading-[1.05] tracking-tight text-white md:text-6xl">
                    Where style meets innovative ways of
                    <br />
                    meeting new fashion
                </h1>

                {/* Subtitle */}
                <p className="mx-auto mt-6 max-w-xl text-sm leading-6 text-white/60 md:text-base">
                    Discover unique styles and explore innovative ways to
                    express yourself through modern fashion.
                </p>
            </div>

            {/* Models */}
            <div className="relative z-10 mx-auto mt-10 flex h-[360px] max-w-[1000px] items-end justify-center gap-2">

                {/* 1 — leans LEFT */}
                <div
                    className="
      relative
      h-[230px] w-[18%]
      -rotate-[4deg]
      origin-bottom
      overflow-hidden
      rounded-t-[100px]
      rounded-b-[20px]
      bg-[#e8e7dc]
    "
                >
                    <img
                        src="/models/model1.png"
                        alt=""
                        className="
        absolute bottom-0 left-1/2
        h-[90%] w-auto
        -translate-x-1/2
        object-contain
      "
                    />
                </div>


                {/* 2 — also leans LEFT, but less */}
                <div
                    className="
      relative
      h-[300px] w-[18%]
      -rotate-[2deg]
      origin-bottom
      overflow-hidden
      rounded-t-[100px]
      rounded-b-[20px]
      bg-[#eeeeeb]
    "
                >
                    <img
                        src="/models/model2.png"
                        alt=""
                        className="
        absolute bottom-0 left-1/2
        h-[92%] w-auto
        -translate-x-1/2
        object-contain
      "
                    />
                </div>


                {/* 3 — STRAIGHT */}
                <div
                    className="
      relative
      h-[350px] w-[19%]
      rotate-0
      origin-bottom
      overflow-hidden
      rounded-t-[110px]
      rounded-b-[20px]
      bg-[#f1f1ed]
    "
                >
                    <img
                        src="/models/model3.png"
                        alt=""
                        className="
        absolute bottom-0 left-1/2
        h-[95%] w-auto
        -translate-x-1/2
        object-contain
      "
                    />
                </div>


                {/* 4 — leans RIGHT */}
                <div
                    className="
      relative
      h-[300px] w-[18%]
      rotate-[2deg]
      origin-bottom
      overflow-hidden
      rounded-t-[100px]
      rounded-b-[20px]
      bg-[#a8755f]
    "
                >
                    <img
                        src="/models/model4.png"
                        alt=""
                        className="
        absolute bottom-0 left-1/2
        h-[92%] w-auto
        -translate-x-1/2
        object-contain
      "
                    />
                </div>


                {/* 5 — also leans RIGHT */}
                <div
                    className="
      relative
      h-[230px] w-[18%]
      rotate-[4deg]
      origin-bottom
      overflow-hidden
      rounded-t-[100px]
      rounded-b-[20px]
      bg-[#777a72]
    "
                >
                    <img
                        src="/models/model5.png"
                        alt=""
                        className="
        absolute bottom-0 left-1/2
        h-[90%] w-auto
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
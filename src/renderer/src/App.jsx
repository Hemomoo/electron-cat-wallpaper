import Masonry from 'react-responsive-masonry'
import { useState, useEffect } from 'react'
import { PhotoSlider } from 'react-photo-view'
import 'react-photo-view/dist/react-photo-view.css'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle
  // DrawerTrigger
} from '@/components/ui/drawer'
import { DownloadIcon } from '@radix-ui/react-icons'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

const photoData = [
  {
    src: 'https://hemoo-1300666941.cos.ap-nanjing.myqcloud.com/landlord-cat/20180206_G1RBZkLEQ_1.jpg',
    width: 3637,
    height: 2433
  },
  {
    src: 'https://hemoo-1300666941.cos.ap-nanjing.myqcloud.com/landlord-cat/20180206_G1RBZkLEQ_3.jpg',
    width: 3637,
    height: 2433
  },
  {
    src: 'https://hemoo-1300666941.cos.ap-nanjing.myqcloud.com/landlord-cat/20180327_G9iR046jb_2.jpg',
    width: 3016,
    height: 3014
  },
  {
    src: 'https://hemoo-1300666941.cos.ap-nanjing.myqcloud.com/landlord-cat/20180409_GblsKkTuh_1.jpg',
    width: 1080,
    height: 1460
  },
  {
    src: 'https://hemoo-1300666941.cos.ap-nanjing.myqcloud.com/landlord-cat/20180409_GblsKkTuh_2.jpg',
    width: 3976,
    height: 3024
  },
  {
    src: 'https://hemoo-1300666941.cos.ap-nanjing.myqcloud.com/landlord-cat/20180409_GblsKkTuh_3.jpg',
    width: 1080,
    height: 1460
  },
  {
    src: 'https://hemoo-1300666941.cos.ap-nanjing.myqcloud.com/landlord-cat/20180409_GblsKkTuh_4.jpg',
    width: 2982,
    height: 4032
  },
  {
    src: 'https://hemoo-1300666941.cos.ap-nanjing.myqcloud.com/landlord-cat/20180418_GcI1Fl6ys.jpg',
    width: 3637,
    height: 2433
  },
  {
    src: 'https://hemoo-1300666941.cos.ap-nanjing.myqcloud.com/landlord-cat/20180601_GjlSY7VWP.jpg',
    width: 1727,
    height: 2591
  },
  {
    src: 'https://hemoo-1300666941.cos.ap-nanjing.myqcloud.com/landlord-cat/20180625_GmU8WygVM_2.jpg',
    width: 1562,
    height: 1080
  },
  {
    src: 'https://hemoo-1300666941.cos.ap-nanjing.myqcloud.com/landlord-cat/20180625_GmU8WygVM_5.jpg',
    width: 2448,
    height: 2766
  },
  {
    src: 'https://hemoo-1300666941.cos.ap-nanjing.myqcloud.com/landlord-cat/20180628_GnvnGv5Xw_2.jpg',
    width: 750,
    height: 2478
  },
  {
    src: 'https://hemoo-1300666941.cos.ap-nanjing.myqcloud.com/landlord-cat/20180724_GrqqcC3m3_1.jpg',
    width: 1000,
    height: 1000
  },
  {
    src: 'https://hemoo-1300666941.cos.ap-nanjing.myqcloud.com/landlord-cat/20180724_GrqqcC3m3_2.jpg',
    width: 1000,
    height: 1000
  },
  {
    src: 'https://hemoo-1300666941.cos.ap-nanjing.myqcloud.com/landlord-cat/20180724_GrqqcC3m3_3.jpg',
    width: 1000,
    height: 1000
  },
  {
    src: 'https://hemoo-1300666941.cos.ap-nanjing.myqcloud.com/landlord-cat/20180803_GsWfwnfY4.jpg',
    width: 1334,
    height: 750
  },
  {
    src: 'https://hemoo-1300666941.cos.ap-nanjing.myqcloud.com/landlord-cat/20180810_GtZMKlhzo_6.jpg',
    width: 1422,
    height: 960
  },
  {
    src: 'https://hemoo-1300666941.cos.ap-nanjing.myqcloud.com/landlord-cat/20181010_GDiU9mNCv.jpg',
    width: 3264,
    height: 2448
  },
  {
    src: 'https://hemoo-1300666941.cos.ap-nanjing.myqcloud.com/landlord-cat/20181011_GDt124pYY.jpg',
    width: 1704,
    height: 2553
  },
  {
    src: 'https://hemoo-1300666941.cos.ap-nanjing.myqcloud.com/landlord-cat/20181104_H1aeLojHz_1.jpg',
    width: 750,
    height: 744
  },
  {
    src: 'https://hemoo-1300666941.cos.ap-nanjing.myqcloud.com/landlord-cat/20181213_H754Y8vZQ_3.jpg',
    width: 3264,
    height: 2183
  },
  {
    src: 'https://hemoo-1300666941.cos.ap-nanjing.myqcloud.com/landlord-cat/20190110_HbiWUCqkv_4.jpg',
    width: 2073,
    height: 2349
  },
  {
    src: 'https://hemoo-1300666941.cos.ap-nanjing.myqcloud.com/landlord-cat/20190221_HhJQ3jt0T_2.jpg',
    width: 3024,
    height: 3024
  },
  {
    src: 'https://hemoo-1300666941.cos.ap-nanjing.myqcloud.com/landlord-cat/20190224_HibzUhXFK_2.jpg',
    width: 2320,
    height: 2320
  },
  {
    src: 'https://hemoo-1300666941.cos.ap-nanjing.myqcloud.com/landlord-cat/20190224_HibzUhXFK_3.jpg',
    width: 4032,
    height: 3024
  },
  {
    src: 'https://hemoo-1300666941.cos.ap-nanjing.myqcloud.com/landlord-cat/20190311_HksfLbGyG_3.jpg',
    width: 4928,
    height: 3264
  },
  {
    src: 'https://hemoo-1300666941.cos.ap-nanjing.myqcloud.com/landlord-cat/20190531_HwIIL3kV5_1.jpg',
    width: 4777,
    height: 3162
  },
  {
    src: 'https://hemoo-1300666941.cos.ap-nanjing.myqcloud.com/landlord-cat/20190531_HwIIL3kV5_2.jpg',
    width: 3264,
    height: 2162
  }
]

function App() {
  const [visible, setVisible] = useState(false)
  const [index, setIndex] = useState(0)
  const [openDrawer, setOpenDrawer] = useState(false)
  const [inputUrl, selInputUrl] = useState('')

  const preview = (index) => {
    setVisible(true)
    setIndex(index)
  }

  // eslint-disable-next-line no-undef
  useEffect(() => {
    console.log('window', window?.electronAPI)
    // window?.electronAPI.onOpenPhotoSlider(() => {
    //   preview(index)
    // })
  }, [])

  window?.electronAPI.onCloseDrawer(() => {
    setOpenDrawer(false)
  })

  window?.electronAPI.onOpenDrawer(() => {
    setOpenDrawer(true)
  })

  const downImg = () => {
    window.electronAPI.downImg(inputUrl)
  }

  return (
    <>
      <div className="w-screen h-screen overflow-auto">
        <Masonry columnsCount={3} gutter="10px">
          {photoData.map((image, i) => (
            <img
              className="cursor-pointer"
              key={i}
              src={image.src}
              onClick={() => {
                preview(index)
              }}
              style={{ width: '100%', display: 'block' }}
            />
          ))}
        </Masonry>
        <PhotoSlider
          images={photoData}
          visible={visible}
          onClose={() => setVisible(false)}
          index={index}
          onIndexChange={setIndex}
        ></PhotoSlider>
        {/* 增加left drawer */}
        <Drawer direction="left" open={openDrawer}>
          {/* <DrawerTrigger>Open</DrawerTrigger> */}
          <DrawerContent className="h-full w-1/3">
            <DrawerHeader>
              <DrawerTitle>Are you absolutely sure?</DrawerTitle>
              <DrawerDescription>This action cannot be undone.</DrawerDescription>
            </DrawerHeader>
            <div className="flex w-full max-w-sm items-center space-x-2">
              <Input
                value={inputUrl}
                placeholder="粘贴链接"
                onChange={(e) => selInputUrl(e.target.value)}
              />
              <Button variant="outline" size="icon" onClick={downImg}>
                <DownloadIcon className="h-4 w-4" />
              </Button>
            </div>
            <DrawerFooter>
              <Button>Submit</Button>
              <DrawerClose>
                <Button variant="outline">Cancel</Button>
              </DrawerClose>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      </div>
    </>
  )
}

export default App

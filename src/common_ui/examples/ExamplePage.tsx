import React, { useState } from 'react';
import { Button, TextField, Card, Badge } from '..';

/**
 * common_ui 컴포넌트 예제 페이지
 * 
 * 이 페이지는 common_ui에서 제공하는 모든 컴포넌트의 사용 예제를 보여줍니다.
 * 개발자가 컴포넌트를 어떻게 사용해야 하는지 쉽게 참고할 수 있습니다.
 */
const ExamplePage: React.FC = () => {
  const [inputValue, setInputValue] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  return (
    <>
      <h1 className="text-3xl font-bold mb-8">Common UI 컴포넌트 예제</h1>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Button</h2>
        <Card>
          <Card.Header>버튼 변형</Card.Header>
          <Card.Body>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <h3 className="font-medium">색상</h3>
                <div className="space-y-2">
                  <Button color="primary" className="mr-2">Primary</Button>
                  <Button color="secondary" className="mr-2">Secondary</Button>
                  <Button color="danger" className="mr-2">Danger</Button>
                  <Button color="success" className="mr-2">Success</Button>
                  <Button color="warning">Warning</Button>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="font-medium">스타일</h3>
                <div className="space-y-2">
                  <Button variant="filled" className="mr-2">Filled</Button>
                  <Button variant="outline" className="mr-2">Outline</Button>
                  <Button variant="ghost">Ghost</Button>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="font-medium">크기</h3>
                <div className="space-y-2">
                  <Button size="sm" className="mr-2">Small</Button>
                  <Button size="md" className="mr-2">Medium</Button>
                  <Button size="lg">Large</Button>
                </div>
              </div>
            </div>
          </Card.Body>
          <Card.Footer>
            <div className="space-y-2">
              <h3 className="font-medium">상태</h3>
              <div className="flex flex-wrap gap-2">
                <Button loading>로딩중</Button>
                <Button disabled>비활성화</Button>
                <Button fullWidth>전체 너비</Button>
              </div>
            </div>
          </Card.Footer>
        </Card>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">TextField</h2>
        <Card>
          <Card.Header>텍스트필드 변형</Card.Header>
          <Card.Body>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <TextField
                  label="이름"
                  placeholder="홍길동"
                  helperText="실명을 입력하세요"
                />

                <TextField
                  label="이메일"
                  type="email"
                  placeholder="example@email.com"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  error={inputValue && !inputValue.includes('@') ? '올바른 이메일 형식이 아닙니다' : false}
                />

                <TextField
                  label="비밀번호"
                  type="password"
                  placeholder="8자 이상 입력"
                  status="warning"
                  helperText="특수문자를 포함하면 더 안전합니다"
                />

                <TextField
                  label="아이디 확인"
                  placeholder="사용할 아이디 입력"
                  status={showSuccess ? 'success' : 'default'}
                  helperText={showSuccess ? '사용 가능한 아이디입니다' : '중복 확인이 필요합니다'}
                />
              </div>

              <Button type="submit">제출하기</Button>
            </form>
          </Card.Body>
        </Card>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Card</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card variant="outlined">
            <Card.Header>윤곽선 카드</Card.Header>
            <Card.Body>
              <p>윤곽선만 있는 기본 카드 스타일입니다.</p>
            </Card.Body>
            <Card.Footer>
              <Button variant="outline" fullWidth>자세히 보기</Button>
            </Card.Footer>
          </Card>

          <Card variant="elevated">
            <Card.Header>그림자 카드</Card.Header>
            <Card.Body>
              <p>그림자 효과가 있는 카드 스타일입니다.</p>
            </Card.Body>
            <Card.Footer>
              <Button variant="outline" fullWidth>자세히 보기</Button>
            </Card.Footer>
          </Card>

          <Card variant="filled">
            <Card.Header>배경색 카드</Card.Header>
            <Card.Body>
              <p>배경색이 있는 카드 스타일입니다.</p>
            </Card.Body>
            <Card.Footer>
              <Button variant="outline" fullWidth>자세히 보기</Button>
            </Card.Footer>
          </Card>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Badge</h2>
        <Card>
          <Card.Header>뱃지 변형</Card.Header>
          <Card.Body>
            <div className="space-y-6">
              <div>
                <h3 className="font-medium mb-2">색상</h3>
                <div className="flex flex-wrap gap-2">
                  <Badge color="primary">Primary</Badge>
                  <Badge color="secondary">Secondary</Badge>
                  <Badge color="success">Success</Badge>
                  <Badge color="warning">Warning</Badge>
                  <Badge color="danger">Danger</Badge>
                  <Badge color="info">Info</Badge>
                </div>
              </div>

              <div>
                <h3 className="font-medium mb-2">스타일</h3>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="filled">Filled</Badge>
                  <Badge variant="outline">Outline</Badge>
                  <Badge variant="soft">Soft</Badge>
                </div>
              </div>

              <div>
                <h3 className="font-medium mb-2">크기</h3>
                <div className="flex flex-wrap gap-2 items-center">
                  <Badge size="sm">Small</Badge>
                  <Badge size="md">Medium</Badge>
                  <Badge size="lg">Large</Badge>
                </div>
              </div>

              <div>
                <h3 className="font-medium mb-2">둥근 정도</h3>
                <div className="flex flex-wrap gap-2">
                  <Badge rounded="none">None</Badge>
                  <Badge rounded="sm">Small</Badge>
                  <Badge rounded="md">Medium</Badge>
                  <Badge rounded="lg">Large</Badge>
                  <Badge rounded="full">Full</Badge>
                </div>
              </div>
            </div>
          </Card.Body>
        </Card>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-4">실제 사용 예시</h2>
        <Card variant="elevated">
          <Card.Header>사용자 프로필</Card.Header>
          <Card.Body>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-blue-500 font-bold text-xl">
                JD
              </div>
              <div>
                <h3 className="text-lg font-medium">홍길동</h3>
                <p className="text-gray-500">프론트엔드 개발자</p>
                <div className="flex gap-1 mt-1">
                  <Badge color="primary" size="sm">React</Badge>
                  <Badge color="info" size="sm" variant="soft">TypeScript</Badge>
                  <Badge color="success" size="sm" variant="outline">3년차</Badge>
                </div>
              </div>
            </div>
            
            <TextField
              label="상태 메시지"
              placeholder="상태 메시지를 입력하세요"
              defaultValue="새로운 프로젝트를 찾고 있습니다."
              fullWidth
            />
          </Card.Body>
          <Card.Footer>
            <div className="flex justify-end gap-2">
              <Button variant="ghost" color="secondary">취소</Button>
              <Button>저장하기</Button>
            </div>
          </Card.Footer>
        </Card>
      </section>
    </>
  );
};

export default ExamplePage;
